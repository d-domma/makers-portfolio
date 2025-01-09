import csv
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

here = Path(__file__).resolve().parent
k = 4
cols = ["temp_c", "rain_mm", "wind", "parks", "buildings", "woods", "cost_k", "sqft", "rooms"]

xrows = []
kinds = []
with open(here / "sites.csv", newline="") as handle:
    reader = csv.DictReader(handle)
    for line in reader:
        row = [float(line[c]) for c in cols]
        row.append(row[0])
        xrows.append(row)
        kinds.append(line["kind"].strip())

block = np.array(xrows, dtype=float)
scaler = StandardScaler()
scaled = scaler.fit_transform(block)
model = KNeighborsClassifier(n_neighbors=k)
model.fit(scaled, kinds)


class PickHandler(BaseHTTPRequestHandler):
    def _send(self, code, payload):
        raw = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_POST(self):
        n = int(self.headers.get("Content-Length", "0") or 0)
        body = self.rfile.read(n) if n else b"{}"
        try:
            got = json.loads(body.decode() or "{}")
        except json.JSONDecodeError:
            self._send(400, {"error": "bad json"})
            return

        vec = []
        for key in ("temp", "rain", "wind", "parks", "buildings", "woods", "cost_k", "sqft", "rooms"):
            try:
                vec.append(float(got.get(key, 0) or 0))
            except (TypeError, ValueError):
                vec.append(0.0)
        vec.append(vec[0])

        point = scaler.transform(np.array([vec], dtype=float))
        kind = model.predict(point)[0]
        dist, idx = model.kneighbors(point)
        near = []
        for i, d in zip(idx[0], dist[0]):
            near.append({"kind": kinds[int(i)], "dist": round(float(d), 3)})

        self._send(200, {"kind": str(kind), "k": k, "neighbors": near})

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    print("knn on 127.0.0.1:5055  k=%s  rows=%s" % (k, len(kinds)))
    ThreadingHTTPServer(("127.0.0.1", 5055), PickHandler).serve_forever()
