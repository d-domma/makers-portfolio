import SwiftUI
import CoreLocation

struct MapView: View {
    @EnvironmentObject var pocket: Pocket

    var body: some View {
        let s = pocket.shade
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Predator Map")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(s.ink)
                Text("View registered sex offenders and active amber alerts in your vicinity")
                    .font(.system(size: 13))
                    .foregroundStyle(s.rose)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: 8) {
                    chip("Show All", "all")
                    chip("Offenders Only", "off")
                    chip("Amber Alerts", "amber")
                }

                GridMap(span: pocket.span, center: pocket.spot, showRoute: false)
                    .frame(height: 340)
                    .gesture(
                        MagnificationGesture()
                            .onEnded { g in
                                var next = pocket.span / Double(g)
                                if next < 0.012 { next = 0.012 }
                                if next > 1.6 { next = 1.6 }
                                pocket.span = next
                            }
                    )

                VStack(alignment: .leading, spacing: 10) {
                    Text("Legend")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(s.ink)
                    legendRow(s.blue, "Your Location", arrow: true)
                    legendRow(s.high, "High Risk Offender", arrow: false)
                    legendRow(s.mid, "Medium Risk Offender", arrow: false)
                    legendRow(s.low, "Low Risk Offender", arrow: false)
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(s.mid)
                            .frame(width: 16)
                        Text("Amber Alert")
                            .font(.system(size: 13))
                            .foregroundStyle(s.ink)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)

                if let pin = pocket.picked {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(pin.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text(pin.detail)
                            .font(.system(size: 12))
                            .foregroundStyle(s.muted)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(s.blush)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 16)
        }
    }

    func chip(_ name: String, _ key: String) -> some View {
        let s = pocket.shade
        let on = pocket.filter == key
        return Button {
            pocket.filter = key
            pocket.picked = nil
        } label: {
            Text(name)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(on ? Color.white : s.tabOff)
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background(on ? s.chip : s.card)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(on ? Color.clear : s.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    func legendRow(_ color: Color, _ name: String, arrow: Bool) -> some View {
        let s = pocket.shade
        return HStack(spacing: 8) {
            if arrow {
                Image(systemName: "location.north.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(color)
                    .frame(width: 16)
            } else {
                Circle().fill(color).frame(width: 8, height: 8).frame(width: 16)
            }
            Text(name)
                .font(.system(size: 13))
                .foregroundStyle(s.ink)
        }
    }
}
