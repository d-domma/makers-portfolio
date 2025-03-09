import SwiftUI
import MessageUI

struct RootView: View {
    @EnvironmentObject var pocket: Pocket

    var body: some View {
        let s = pocket.shade
        VStack(spacing: 0) {
            VStack(spacing: 3) {
                Image(systemName: "diamond.fill")
                    .font(.system(size: 7))
                    .foregroundStyle(s.north)
                Text("NORTH")
                    .font(.system(size: 13, weight: .medium))
                    .tracking(3.6)
                    .foregroundStyle(s.north)
            }
            .padding(.top, 4)
            .padding(.bottom, 8)
            Rectangle().fill(s.line).frame(height: 1)

            Group {
                if pocket.tab == 0 {
                    HomeView()
                } else if pocket.tab == 1 {
                    MapView()
                } else if pocket.tab == 2 {
                    PathView()
                } else if pocket.tab == 3 {
                    CheckView()
                } else {
                    SettingsView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            HStack(spacing: 0) {
                tabItem(0, "house.fill", "house", "Home")
                tabItem(1, "map.fill", "map", "Map")
                tabItem(2, "paperplane.fill", "paperplane", "SafePath")
                tabItem(3, "heart.fill", "heart", "Check-in")
                tabItem(4, "gearshape.fill", "gearshape", "Settings")
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 6)
            .background(s.card)
            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
            .shadow(color: .black.opacity(0.06), radius: 10, y: 2)
            .padding(.horizontal, 14)
            .padding(.bottom, 6)
        }
        .background(s.page.ignoresSafeArea())
        .onAppear { pocket.boot() }
        .sheet(isPresented: $pocket.showScam) {
            ScamSheet()
        }
        .sheet(item: $pocket.outgoing) { note in
            TextSend(body: note.body, phones: pocket.people.map { $0.phone }) {
                pocket.outgoing = nil
            }
        }
    }

    func tabItem(_ i: Int, _ onIcon: String, _ offIcon: String, _ name: String) -> some View {
        let s = pocket.shade
        let on = pocket.tab == i
        return Button {
            pocket.tab = i
        } label: {
            VStack(spacing: 2) {
                Image(systemName: on ? onIcon : offIcon)
                    .font(.system(size: 16))
                Text(name)
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundStyle(on ? s.tabOnInk : s.tabOff)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .background(on ? s.tabOn : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

struct OutNote: Identifiable {
    var id = UUID()
    var body: String
}

struct TextSend: UIViewControllerRepresentable {
    var body: String
    var phones: [String]
    var done: () -> Void

    func makeUIViewController(context: Context) -> MFMessageComposeViewController {
        let vc = MFMessageComposeViewController()
        vc.body = body
        vc.recipients = phones
        vc.messageComposeDelegate = context.coordinator
        return vc
    }

    func updateUIViewController(_ uiViewController: MFMessageComposeViewController, context: Context) {}

    func makeCoordinator() -> Coord { Coord(done: done) }

    final class Coord: NSObject, MFMessageComposeViewControllerDelegate {
        var done: () -> Void
        init(done: @escaping () -> Void) { self.done = done }
        func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) {
            controller.dismiss(animated: true)
            done()
        }
    }
}
