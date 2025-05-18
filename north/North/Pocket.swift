import SwiftUI
import CoreLocation
import UserNotifications
import MessageUI

struct Person: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var name: String
    var phone: String
}

struct Pin: Identifiable {
    var id = UUID()
    var lat: Double
    var lon: Double
    var band: String
    var title: String
    var detail: String
    var coord: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }
}

struct Reg: Codable {
    var name: String
    var addr: String
    var band: String
    var detail: String
}

@MainActor
final class Pocket: NSObject, ObservableObject, CLLocationManagerDelegate {
    let manager = CLLocationManager()
    let square = CLLocationCoordinate2D(latitude: 34.2074, longitude: -84.1402)

    @Published var tab = 0
    @Published var dark = false
    @Published var people: [Person] = []
    @Published var pins: [Pin] = []
    @Published var filter = "all"
    @Published var span = 0.055
    @Published var pathSpan = 0.0
    @Published var spot = CLLocationCoordinate2D(latitude: 34.2074, longitude: -84.1402)
    @Published var heading = 42.0
    @Published var fixDenied = false
    @Published var route: [CLLocationCoordinate2D] = []
    @Published var destName = "Home"
    @Published var miles = 1.2
    @Published var minutes = 15
    @Published var walked = 0.4
    @Published var safe = 92
    @Published var routeNotes: [String] = []
    @Published var checkEnd: Date? = nil
    @Published var meet = ""
    @Published var going = ""
    @Published var showAdd = false
    @Published var showScam = false
    @Published var scamText = ""
    @Published var scamScore = -1
    @Published var scamBits: [String] = []
    @Published var tick = Date()
    @Published var picked: Pin? = nil
    @Published var outgoing: OutNote? = nil

    var home = CLLocationCoordinate2D(latitude: 34.2195, longitude: -84.1220)
    var lastGood: CLLocation?
    var lastSpeed = 0.0
    var offenders: [Pin] = []
    var ambers: [Pin] = []
    var usingLive = false
    var spots: [String: (Double, Double)] = [:]
    var geoBusy = false
    var routeBusy = false
    var routeIsLive = false
    var routedFrom = CLLocationCoordinate2D(latitude: 0, longitude: 0)
    var lastGoingRouted = ""

    var shade: Shade { dark ? .night : .day }

    var trackLine: String {
        if fixDenied { return "Location off" }
        return "Location tracking active"
    }

    var shown: [Pin] {
        let src = pins
        if filter == "amber" { return src.filter { $0.band == "amber" } }
        if filter == "off" { return src.filter { $0.band != "amber" } }
        return src
    }

    override init() {
        super.init()
        pins = Pocket.starter()
        route = Pocket.starterRoute()
        people = Pocket.seedPeople()
    }

    func boot() {
        startFix()
        loadPeople()
        if UserDefaults.standard.object(forKey: "north.dark") != nil {
            dark = UserDefaults.standard.bool(forKey: "north.dark")
        }
        Task { await pullRegistry() }
    }

    func startFix() {
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        manager.distanceFilter = 8
        manager.headingFilter = 8
        manager.activityType = .otherNavigation
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
        manager.startUpdatingHeading()
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locs: [CLLocation]) {
        let loc = locs.last
        Task { @MainActor in
            self.take(loc)
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let acc = newHeading.headingAccuracy
        let raw = newHeading.trueHeading >= 0 ? newHeading.trueHeading : newHeading.magneticHeading
        Task { @MainActor in
            self.takeHeading(raw, acc)
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        Task { @MainActor in
            self.fixDenied = status == .denied || status == .restricted
        }
    }

    func take(_ loc: CLLocation?) {
        guard let loc else { return }
        if loc.horizontalAccuracy < 0 { return }
        if let prev = lastGood {
            if loc.horizontalAccuracy > 90 && prev.horizontalAccuracy < 70 { return }
            if loc.horizontalAccuracy > prev.horizontalAccuracy + 25 && loc.horizontalAccuracy > 45 {
                return
            }
        }
        lastGood = loc
        spot = loc.coordinate
        lastSpeed = loc.speed
        if loc.course >= 0 && loc.speed > 0.8 {
            heading = loc.course
        }
    }

    func takeHeading(_ raw: Double, _ acc: Double) {
        if acc < 0 || acc > 45 { return }
        if lastSpeed > 0.8 { return }
        var diff = raw - heading
        while diff > 180 { diff -= 360 }
        while diff < -180 { diff += 360 }
        heading = heading + diff * 0.35
        if heading < 0 { heading += 360 }
        if heading >= 360 { heading -= 360 }
    }

    func dial() {
        if let url = URL(string: "tel://911") {
            UIApplication.shared.open(url)
        }
    }

    func held() {
        let body = "North alert. I need help. " + String(format: "%.5f, %.5f", spot.latitude, spot.longitude)
        ping("Emergency alert", body, after: nil)
        if MFMessageComposeViewController.canSendText() {
            outgoing = OutNote(body: body)
        }
    }

    func askAdd() { showAdd = true }

    func addPerson(_ name: String, _ phone: String) {
        let n = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if n.isEmpty { return }
        let p = phone.trimmingCharacters(in: .whitespacesAndNewlines)
        people.append(Person(name: n, phone: p))
        savePeople()
    }

    func dropPerson(_ id: UUID) {
        people = people.filter { $0.id != id }
        savePeople()
    }

    func setDark(_ on: Bool) {
        dark = on
        UserDefaults.standard.set(on, forKey: "north.dark")
    }

    func keepNote() {
    }

    func startCheck() {
    }

    func endCheck() {
    }

    func pokeCheck() {
    }

    func scan() {
    }

    func scoreScam() {
    }

    func homeFromPress() {
    }

    func maybeRoute(force: Bool) {
    }




    func pullRegistry() async {
        guard let url = URL(string: "https://state.sor.gbi.ga.gov/SORT_PUBLIC/sor.csv") else { return }
        var req = URLRequest(url: url)
        req.timeoutInterval = 45
        guard let (data, resp) = try? await URLSession.shared.data(for: req) else { return }
        if let http = resp as? HTTPURLResponse, http.statusCode != 200 { return }
        let text = String(decoding: data, as: UTF8.self)
        let rows = await Task.detached { Pocket.rowsFrom(text) }.value
        if rows.isEmpty { return }
        saveRowCache(rows)
    }







    func ping(_ title: String, _ body: String, after: TimeInterval?) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { ok, _ in
            if !ok { return }
            let note = UNMutableNotificationContent()
            note.title = title
            note.body = body
            var trigger: UNNotificationTrigger? = nil
            if let after, after > 1 {
                trigger = UNTimeIntervalNotificationTrigger(timeInterval: after, repeats: false)
            }
            let req = UNNotificationRequest(identifier: title, content: note, trigger: trigger)
            UNUserNotificationCenter.current().add(req)
        }
    }


    func cacheFile(_ name: String) -> URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent(name)
    }




    func saveRowCache(_ rows: [Reg]) {
        if let data = try? JSONEncoder().encode(rows) {
            try? data.write(to: cacheFile("forsyth-rows.json"))
        }
    }

    func loadPeople() {
        if let data = UserDefaults.standard.data(forKey: "north.people"),
           let list = try? JSONDecoder().decode([Person].self, from: data),
           !list.isEmpty {
            people = list
            return
        }
        people = Pocket.seedPeople()
        savePeople()
    }

    func savePeople() {
        if let data = try? JSONEncoder().encode(people) {
            UserDefaults.standard.set(data, forKey: "north.people")
        }
    }

    static func seedPeople() -> [Person] {
        [
            Person(name: "Mom", phone: "+1 (555) 123-4567"),
            Person(name: "Best Friend", phone: "+1 (555) 987-6543"),
            Person(name: "Partner", phone: "+1 (555) 246-8135"),
        ]
    }

    static func starter() -> [Pin] {
        let rows: [(Double, Double, String, String)] = [
            (34.2228, -84.1479, "high", "High Risk Offender"),
            (34.2184, -84.1402, "amber", "Amber Alert"),
            (34.2162, -84.1325, "low", "Low Risk Offender"),
            (34.2074, -84.1270, "high", "High Risk Offender"),
            (34.1997, -84.1303, "mid", "Medium Risk Offender"),
            (34.1964, -84.1468, "mid", "Medium Risk Offender"),
            (34.1952, -84.1369, "amber", "Amber Alert"),
        ]
        return rows.map { Pin(lat: $0.0, lon: $0.1, band: $0.2, title: $0.3, detail: $0.3) }
    }

    static func starterRoute() -> [CLLocationCoordinate2D] {
        [
            CLLocationCoordinate2D(latitude: 34.2074, longitude: -84.1402),
            CLLocationCoordinate2D(latitude: 34.2118, longitude: -84.1365),
            CLLocationCoordinate2D(latitude: 34.2146, longitude: -84.1338),
            CLLocationCoordinate2D(latitude: 34.2132, longitude: -84.1295),
            CLLocationCoordinate2D(latitude: 34.2168, longitude: -84.1258),
            CLLocationCoordinate2D(latitude: 34.2195, longitude: -84.1220),
        ]
    }

    nonisolated static func rowsFrom(_ text: String) -> [Reg] {
        var lines: [String] = []
        text.enumerateLines { line, _ in
            if !line.trimmingCharacters(in: .whitespaces).isEmpty {
                lines.append(line)
            }
        }
        if lines.count < 2 { return [] }
        let head = splitCSV(lines[0]).map { $0.trimmingCharacters(in: .whitespacesAndNewlines).uppercased() }
        func col(_ name: String) -> Int { head.firstIndex(of: name) ?? -1 }
        let iCounty = col("COUNTY")
        let iState = col("STATE")
        let iNum = col("STREET NUMBER")
        let iStreet = col("STREET")
        let iCity = col("CITY")
        let iZip = col("ZIP CODE")
        let iName = col("NAME")
        let iCrime = col("CRIME")
        let iLevel = col("LEVELING")
        let iPred = col("PREDATOR")
        let iAbs = col("ABSCONDER")
        let iJail = col("INCARCERATED")
        if iCounty < 0 || iStreet < 0 || iName < 0 { return [] }
        var out: [Reg] = []
        var n = 1
        while n < lines.count {
            let f = splitCSV(lines[n])
            n += 1
            func val(_ i: Int) -> String {
                if i < 0 || i >= f.count { return "" }
                return f[i].trimmingCharacters(in: .whitespacesAndNewlines)
            }
            if val(iCounty).uppercased() != "FORSYTH" { continue }
            if iState >= 0 && val(iState).uppercased() != "GA" { continue }
            if val(iJail).uppercased() == "INCARCERATED" { continue }
            let num = val(iNum)
            let street = val(iStreet)
            if num.isEmpty || street.isEmpty { continue }
            let city = val(iCity)
            let zip = val(iZip)
            let addr = num + " " + street + ", " + city + ", GA " + zip
            let level = val(iLevel).uppercased()
            let pred = val(iPred).uppercased()
            let absn = val(iAbs).uppercased()
            var band = "low"
            if pred.contains("PREDATOR") || level.contains("DANGEROUS") || level.contains("PREDATOR") {
                band = "high"
            } else if level.contains("LEVEL 2") {
                band = "mid"
            }
            if absn.contains("ABSCONDER") {
                if band == "low" { band = "mid" }
                else if band == "mid" { band = "high" }
            }
            let shownLevel = val(iLevel).isEmpty ? "NOT LEVELED" : val(iLevel)
            let detail = shownLevel + " · " + city + "\n" + val(iCrime)
            out.append(Reg(name: val(iName), addr: addr, band: band, detail: detail))
        }
        return out
    }

    nonisolated static func splitCSV(_ line: String) -> [String] {
        var out: [String] = []
        var cur = ""
        var q = false
        var i = line.startIndex
        while i < line.endIndex {
            let c = line[i]
            if c == "\"" {
                let n = line.index(after: i)
                if q && n < line.endIndex && line[n] == "\"" {
                    cur.append("\"")
                    i = line.index(after: n)
                    continue
                }
                q.toggle()
                i = n
                continue
            }
            if c == "," && !q {
                out.append(cur)
                cur = ""
                i = line.index(after: i)
                continue
            }
            cur.append(c)
            i = line.index(after: i)
        }
        out.append(cur)
        return out
    }
}
