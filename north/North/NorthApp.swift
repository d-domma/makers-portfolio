import SwiftUI

@main
struct NorthApp: App {
    @StateObject var pocket = Pocket()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(pocket)
        }
    }
}
