import SwiftUI
import Combine

struct CheckView: View {
    @EnvironmentObject var pocket: Pocket

    var body: some View {
        let s = pocket.shade
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "heart")
                        .font(.system(size: 14))
                        .foregroundStyle(s.rose)
                        .padding(.top, 2)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Check-In Mode")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text("Set a safety timer for outings and meetups")
                            .font(.system(size: 12))
                            .foregroundStyle(s.muted)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.blush)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                VStack(spacing: 8) {
                    Image(systemName: "clock")
                        .font(.system(size: 42, weight: .light))
                        .foregroundStyle(s.icon)
                        .padding(.bottom, 6)
                    if let end = pocket.checkEnd, end > pocket.tick {
                        Text(left(end))
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text("Check-in running")
                            .font(.system(size: 13))
                            .foregroundStyle(s.muted)
                        Button {
                            pocket.endCheck()
                        } label: {
                            Text("End Check-In")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                                .background(s.chip)
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                        .buttonStyle(.plain)
                        .padding(.top, 8)
                    } else if pocket.checkEnd != nil {
                        Text("Check-in missed")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text("The hour ran out")
                            .font(.system(size: 13))
                            .foregroundStyle(s.muted)
                        goButton
                    } else {
                        Text("No Active Check-In")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(s.ink)
                        Text("Start a timer before going out")
                            .font(.system(size: 13))
                            .foregroundStyle(s.muted)
                        goButton
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)

                VStack(alignment: .leading, spacing: 10) {
                    Text("Before You Go...")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(s.ink)
                    field("person", "Who are you meeting?", "Add name or description", $pocket.meet)
                    field("mappin", "Where are you going?", "Share location details", $pocket.going)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)

                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 6) {
                        Image(systemName: "phone")
                            .font(.system(size: 12))
                            .foregroundStyle(s.rose)
                        Text("Notified Contacts")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(s.ink)
                    }
                    ForEach(pocket.people) { person in
                        HStack {
                            Text(person.name)
                                .font(.system(size: 14))
                                .foregroundStyle(s.ink)
                            Spacer()
                            Text("Will be alerted")
                                .font(.system(size: 12))
                                .foregroundStyle(s.rose)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .overlay(Capsule().stroke(s.chip, lineWidth: 1))
                        }
                        .padding(.vertical, 4)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(s.card)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 18)
        }
        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { d in
            pocket.tick = d
            pocket.pokeCheck()
        }
        .onChange(of: pocket.meet) { _, _ in pocket.keepNote() }
        .onChange(of: pocket.going) { _, _ in pocket.keepNote() }
    }

    var goButton: some View {
        let s = pocket.shade
        return Button {
            pocket.startCheck()
        } label: {
            Text("Start 60-Minute Check-In")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(s.chip)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)
        .padding(.top, 8)
    }

    func field(_ icon: String, _ title: String, _ hint: String, _ text: Binding<String>) -> some View {
        let s = pocket.shade
        return HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(s.rose)
                .frame(width: 22)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(s.ink)
                TextField("", text: text, prompt: Text(hint).foregroundColor(s.muted))
                    .font(.system(size: 12))
                    .foregroundStyle(s.ink)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(s.field)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    func left(_ end: Date) -> String {
        let s = Int(end.timeIntervalSince(pocket.tick))
        let m = max(0, s) / 60
        let r = max(0, s) % 60
        return String(format: "%d:%02d left", m, r)
    }
}
