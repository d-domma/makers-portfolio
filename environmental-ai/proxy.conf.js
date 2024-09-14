const skyBits = {
  target: "https://api.open-meteo.com",
  secure: true,
  changeOrigin: true,
  pathRewrite: { "^/api/sky": "/v1/forecast" }
};

const placeBits = {
  target: "https://nominatim.openstreetmap.org",
  secure: true,
  changeOrigin: true,
  pathRewrite: { "^/api/place": "/search" },
  headers: { "User-Agent": "env-ai-design/1.0 (school project)" }
};

const groundBits = {
  target: "https://overpass-api.de",
  secure: true,
  changeOrigin: true,
  pathRewrite: { "^/api/ground": "/api/interpreter" },
  headers: { "User-Agent": "env-ai-design/1.0 (school project)" }
};

const talkBits = {
  target: "https://text.pollinations.ai",
  secure: true,
  changeOrigin: true,
  pathRewrite: { "^/api/chat": "/openai" },
  headers: {
    origin: "https://text.pollinations.ai",
    referer: "https://text.pollinations.ai/"
  },
  onProxyReq(proxyReq) {
    proxyReq.removeHeader("origin");
    proxyReq.removeHeader("referer");
  }
};

const knnBits = {
  target: "http://127.0.0.1:5055",
  secure: false,
  changeOrigin: true,
  pathRewrite: { "^/api/pick": "/" }
};

module.exports = {
  "/api/sky": skyBits,
  "/api/place": placeBits,
  "/api/ground": groundBits,
  "/api/chat": talkBits,
  "/api/pick": knnBits
};
