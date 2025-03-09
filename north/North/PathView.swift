import SwiftUI
import CoreLocation

struct PathView: View {
    @EnvironmentObject var pocket: Pocket

    var body: some View {
        let s = pocket.shade
        let frame = fitted()
        let center = frame.0
        let span = pocket.pathSpan > 0.001 ? pocket.pathSpan : frame.1
        let frac: Double = pocket.miles > 0.05 ? min(1, pocket.walked / pocket.miles) : 0
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "location.north.fill")
                        .font(.system(size: 13))
                        .foregroundStyle(s.rose)
                        .padding(.top, 2)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("SafePath Route Monitor")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text("AI-guided safe navigation with real-time alerts")
                            .font(.system(size: 12))
                            .foregroundStyle(s.muted)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.blush)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                ZStack(alignment: .topTrailing) {
                    GridMap(span: span, center: center, showRoute: true)
                    VStack(spacing: 6) {
                        zoom("plus", false, span)
                        zoom("minus", true, span)
                    }
                    .padding(10)

                    VStack(alignment: .leading, spacing: 4) {
                        tiny(s.blue, "Your Location", true)
                        tiny(s.route, "Waypoints", false)
                        HStack(spacing: 6) {
                            Circle().fill(Color(red: 0.22, green: 0.75, blue: 0.42)).frame(width: 8, height: 8)
                            Text("Destination")
                                .font(.system(size: 11))
                                .foregroundStyle(s.ink)
                        }
                    }
                    .padding(8)
                    .background(s.card.opacity(0.94))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .padding(10)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                }
                .frame(height: 250)
                .onLongPressGesture(minimumDuration: 0.8) {
                    pocket.homeFromPress()
                }

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        HStack(spacing: 6) {
                            Image(systemName: "mappin.circle")
                                .foregroundStyle(s.rose)
                            Text("Current Route")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(s.ink)
                        }
                        Spacer()
                        Text("\(pocket.safe)% Safe")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(s.safeInk)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(s.safeBg)
                            .clipShape(Capsule())
                    }
                    row("Destination", pocket.destName, nil)
                    row("Distance", String(format: "%.1f miles", pocket.miles), nil)
                    row("Est. Time", "\(pocket.minutes) min", "clock")
                    VStack(alignment: .leading, spacing: 6) {
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                Capsule().fill(s.track)
                                Capsule().fill(s.icon).frame(width: max(6, g.size.width * frac))
                            }
                        }
                        .frame(height: 6)
                        Text(String(format: "%.1f miles traveled", pocket.walked))
                            .font(.system(size: 11))
                            .foregroundStyle(s.muted)
                    }
                }
                .padding(14)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)

                Text("Route Safety Alerts")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(s.ink)
                    .padding(.top, 4)
                ForEach(Array(pocket.routeNotes.enumerated()), id: \.offset) { _, line in
                    Text(line)
                        .font(.system(size: 13))
                        .foregroundStyle(s.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 18)
        }
        .onAppear { pocket.maybeRoute(force: false) }
        .onChange(of: pocket.going) { _, _ in
            pocket.maybeRoute(force: true)
        }
    }

    func zoom(_ icon: String, _ out: Bool, _ span: Double) -> some View {
        let s = pocket.shade
        return Button {
            var base = pocket.pathSpan
            if base < 0.008 { base = span }
            if out { base = base * 1.28 } else { base = base * 0.78 }
            if base < 0.008 { base = 0.008 }
            if base > 0.42 { base = 0.42 }
            pocket.pathSpan = base
        } label: {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(s.ink)
                .frame(width: 28, height: 28)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                .shadow(color: .black.opacity(0.08), radius: 3, y: 1)
        }
        .buttonStyle(.plain)
    }

    func tiny(_ color: Color, _ name: String, _ arrow: Bool) -> some View {
        let s = pocket.shade
        return HStack(spacing: 6) {
            if arrow {
                Image(systemName: "location.north.fill").font(.system(size: 9)).foregroundStyle(color).frame(width: 10)
            } else {
                Circle().fill(color).frame(width: 8, height: 8)
            }
            Text(name).font(.system(size: 11)).foregroundStyle(s.ink)
        }
    }

    func row(_ left: String, _ right: String, _ icon: String?) -> some View {
        let s = pocket.shade
        return HStack {
            Text(left).font(.system(size: 14)).foregroundStyle(s.muted)
            Spacer()
            HStack(spacing: 4) {
                if let icon {
                    Image(systemName: icon).font(.system(size: 11)).foregroundStyle(s.muted)
                }
                Text(right).font(.system(size: 14, weight: .medium)).foregroundStyle(s.ink)
            }
        }
    }

    func fitted() -> (CLLocationCoordinate2D, Double) {
        let pts = pocket.route
        if pts.isEmpty {
            return (pocket.spot, 0.04)
        }
        var minLat = pts[0].latitude
        var maxLat = minLat
        var minLon = pts[0].longitude
        var maxLon = minLon
        for p in pts {
            if p.latitude < minLat { minLat = p.latitude }
            if p.latitude > maxLat { maxLat = p.latitude }
            if p.longitude < minLon { minLon = p.longitude }
            if p.longitude > maxLon { maxLon = p.longitude }
        }
        let mid = CLLocationCoordinate2D(latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2)
        var s = max(maxLat - minLat, maxLon - minLon) * 1.55
        if s < 0.012 { s = 0.012 }
        return (mid, s)
    }
}
