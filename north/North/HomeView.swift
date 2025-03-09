import SwiftUI

struct HomeView: View {
    @EnvironmentObject var pocket: Pocket
    @GestureState var pressing = false

    var body: some View {
        let s = pocket.shade
        let n = pocket.people.count
        ScrollView(showsIndicators: false) {
            VStack(spacing: 14) {
                VStack(spacing: 4) {
                    Text("Protected Every Step")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(s.rose)
                    Text("Your personal safety companion, always by your side")
                        .font(.system(size: 12))
                        .foregroundStyle(s.muted)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 16)
                .padding(.horizontal, 24)

                VStack(spacing: 12) {
                    HStack(spacing: 6) {
                        Image(systemName: "info.circle")
                            .font(.system(size: 14))
                        Text("Emergency Alert")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(.white)

                    Text("Press and hold to send emergency alerts")
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.92))

                    ZStack {
                        Circle()
                            .fill(.white)
                            .frame(width: 148, height: 148)
                            .scaleEffect(pressing ? 0.96 : 1)
                        Image(systemName: "phone.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(s.emergency)
                    }
                    .padding(.vertical, 6)
                    .highPriorityGesture(
                        LongPressGesture(minimumDuration: 1.15)
                            .updating($pressing) { val, state, _ in
                                state = val
                            }
                            .onEnded { _ in
                                pocket.held()
                            }
                    )

                    HStack(spacing: 6) {
                        Image(systemName: "person.2.fill").font(.system(size: 11))
                        Text("\(n) contact\(n == 1 ? "" : "s") configured")
                            .font(.system(size: 12))
                    }
                    .foregroundStyle(.white)

                    HStack(spacing: 6) {
                        Image(systemName: "location.fill").font(.system(size: 11))
                        Text(pocket.trackLine)
                            .font(.system(size: 12))
                    }
                    .foregroundStyle(.white.opacity(0.95))
                }
                .padding(.vertical, 18)
                .padding(.horizontal, 16)
                .frame(maxWidth: .infinity)
                .background(s.emergency)
                .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                .padding(.horizontal, 18)

                Button {
                    pocket.dial()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "phone.fill")
                        Text("Call 911 / Police")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(s.red)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 18)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    tile("map.fill", s.icon, "Safety Map", "View alerts nearby", 1)
                    tile("paperplane.fill", s.icon, "SafePath", "Safe route guide", 2)
                    tile("heart.fill", s.iconSoft, "Check-In", "Safety timer", 3)
                    scamTile
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 12)
            }
        }
    }

    func tile(_ icon: String, _ tint: Color, _ title: String, _ sub: String, _ go: Int) -> some View {
        let s = pocket.shade
        return Button {
            pocket.tab = go
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(tint)
                    .frame(width: 46, height: 46)
                    .overlay(
                        Image(systemName: icon)
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(.white)
                    )
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(s.ink)
                Text(sub)
                    .font(.system(size: 12))
                    .foregroundStyle(s.muted)
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 118, alignment: .leading)
            .background(s.card)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 3)
        }
        .buttonStyle(.plain)
    }

    var scamTile: some View {
        let s = pocket.shade
        return Button {
            pocket.scan()
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(s.iconDeep)
                    .frame(width: 46, height: 46)
                    .overlay(
                        Image(systemName: "shield.fill")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(.white)
                    )
                Text("Scam Scan")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(s.ink)
                Text("AI detector")
                    .font(.system(size: 12))
                    .foregroundStyle(s.muted)
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 118, alignment: .leading)
            .background(s.card)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 3)
        }
        .buttonStyle(.plain)
    }
}

struct ScamSheet: View {
    @EnvironmentObject var pocket: Pocket
    @Environment(\.dismiss) var dismiss

    var body: some View {
        let s = pocket.shade
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("Scam Scan")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(s.ink)
                    Spacer()
                    Button("Close") { dismiss() }
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(s.rose)
                }
                Text("Paste the text. This checks the wording on the phone.")
                    .font(.system(size: 13))
                    .foregroundStyle(s.muted)

                TextEditor(text: $pocket.scamText)
                    .frame(minHeight: 140)
                    .padding(8)
                    .scrollContentBackground(.hidden)
                    .background(s.field)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .foregroundStyle(s.ink)

                Button {
                    pocket.scoreScam()
                } label: {
                    Text("Scan")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(s.chip)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)

                if pocket.scamScore >= 0 {
                    Text(pocket.scamScore >= 40 ? "Looks off (\(pocket.scamScore))" : "Nothing strong (\(pocket.scamScore))")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(s.ink)
                    ForEach(pocket.scamBits, id: \.self) { bit in
                        Text(bit)
                            .font(.system(size: 13))
                            .foregroundStyle(s.muted)
                    }
                }
            }
            .padding(20)
        }
        .background(s.page)
    }
}
