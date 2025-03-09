import SwiftUI
import CoreLocation

struct GridMap: View {
    @EnvironmentObject var pocket: Pocket
    var span: Double
    var center: CLLocationCoordinate2D
    var showRoute: Bool

    var body: some View {
        let s = pocket.shade
        GeometryReader { g in
            let size = g.size
            ZStack {
                s.grid
                Path { p in
                    let n = 6
                    var i = 1
                    while i < n {
                        let x = size.width * CGFloat(i) / CGFloat(n)
                        p.move(to: CGPoint(x: x, y: 0))
                        p.addLine(to: CGPoint(x: x, y: size.height))
                        let y = size.height * CGFloat(i) / CGFloat(n)
                        p.move(to: CGPoint(x: 0, y: y))
                        p.addLine(to: CGPoint(x: size.width, y: y))
                        i += 1
                    }
                }
                .stroke(s.gridLine, lineWidth: 1)

                if showRoute && pocket.route.count > 1 {
                    Path { p in
                        var first = true
                        for c in pocket.route {
                            let pt = put(c, size)
                            if first {
                                p.move(to: pt)
                                first = false
                            } else {
                                p.addLine(to: pt)
                            }
                        }
                    }
                    .stroke(s.route, style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))

                    let step = max(1, pocket.route.count / 4)
                    ForEach(Array(pocket.route.enumerated()), id: \.offset) { i, c in
                        if i > 0 && i < pocket.route.count - 1 && i % step == 0 {
                            Circle()
                                .fill(s.card)
                                .overlay(Circle().stroke(s.route, lineWidth: 3))
                                .frame(width: 16, height: 16)
                                .position(put(c, size))
                        }
                    }

                    if let last = pocket.route.last {
                        ZStack {
                            Circle().stroke(Color(red: 0.20, green: 0.72, blue: 0.40), lineWidth: 3)
                            Circle().fill(Color(red: 0.22, green: 0.78, blue: 0.42)).frame(width: 8, height: 8)
                        }
                        .frame(width: 20, height: 20)
                        .position(put(last, size))
                    }
                }

                ForEach(pocket.shown) { pin in
                    Button {
                        pocket.picked = pin
                    } label: {
                        if pin.band == "amber" {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.system(size: 16))
                                .foregroundStyle(s.mid)
                        } else {
                            Circle()
                                .fill(pin.band == "high" ? s.high : (pin.band == "mid" ? s.mid : s.low))
                                .frame(width: 10, height: 10)
                        }
                    }
                    .buttonStyle(.plain)
                    .position(put(pin.coord, size))
                }

                ZStack {
                    Circle()
                        .fill(s.blue.opacity(0.22))
                        .frame(width: 36, height: 36)
                    Image(systemName: "location.north.fill")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(s.blue)
                        .rotationEffect(.degrees(pocket.heading))
                }
                .position(put(pocket.spot, size))
            }
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
    }

    func put(_ c: CLLocationCoordinate2D, _ size: CGSize) -> CGPoint {
        let dx = (c.longitude - center.longitude) / span
        let dy = (c.latitude - center.latitude) / span
        return CGPoint(x: size.width * (0.5 + dx), y: size.height * (0.5 - dy))
    }
}
