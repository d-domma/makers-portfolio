import SwiftUI
import CoreLocation
import MapKit
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
        if UserDefaults.standard.object(forKey: "north.homeLat") != nil {
            home = CLLocationCoordinate2D(
                latitude: UserDefaults.standard.double(forKey: "north.homeLat"),
                longitude: UserDefaults.standard.double(forKey: "north.homeLon")
            )
        }
        meet = UserDefaults.standard.string(forKey: "north.meet") ?? ""
        going = UserDefaults.standard.string(forKey: "north.going") ?? ""
        let stamp = UserDefaults.standard.double(forKey: "north.checkEnd")
        if stamp > 0 { checkEnd = Date(timeIntervalSince1970: stamp) }
        loadSpotCache()
        Task { await pullRegistry() }
        pokeCheck()
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
        if routeIsLive {
            walkedAlong(route)
        }
        maybeRoute(force: false)
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
        UserDefaults.standard.set(meet, forKey: "north.meet")
        UserDefaults.standard.set(going, forKey: "north.going")
    }

    func startCheck() {
        let end = Date().addingTimeInterval(60 * 60)
        checkEnd = end
        UserDefaults.standard.set(end.timeIntervalSince1970, forKey: "north.checkEnd")
        keepNote()
        var body = "The 60 minutes are up."
        if !meet.isEmpty { body += " Meeting " + meet + "." }
        if !going.isEmpty { body += " Place " + going + "." }
        body += " Last spot " + String(format: "%.5f, %.5f", spot.latitude, spot.longitude)
        ping("Check-in", body, after: 60 * 60)
        UserDefaults.standard.set(0.0, forKey: "north.missedFor")
    }

    func endCheck() {
        checkEnd = nil
        UserDefaults.standard.set(0.0, forKey: "north.checkEnd")
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["Check-in"])
    }

    func pokeCheck() {
        guard let end = checkEnd else { return }
        if end > Date() { return }
        if Date().timeIntervalSince(end) > 6 * 3600 { return }
        let stamp = end.timeIntervalSince1970
        if UserDefaults.standard.double(forKey: "north.missedFor") == stamp { return }
        UserDefaults.standard.set(stamp, forKey: "north.missedFor")
        let body = "Check-in missed. Last spot " + String(format: "%.5f, %.5f", spot.latitude, spot.longitude)
        if MFMessageComposeViewController.canSendText() {
            outgoing = OutNote(body: body)
        }
    }

    func scan() { showScam = true }

    func scoreScam() {
        let raw = scamText
        let t = raw.lowercased()
        var bits: [String] = []
        var n = 0
        if t.contains("gift card") || t.contains("itunes") || t.contains("google play card") || t.contains("steam card") {
            bits.append("Asks for a gift card")
            n += 30
        }
        if t.contains("wire") || t.contains("bitcoin") || t.contains("crypto") || t.contains("venmo") || t.contains("cash app") {
            bits.append("Wants a payment that is hard to undo")
            n += 22
        }
        if t.contains("urgent") || t.contains("immediately") || t.contains("act now") || t.contains("suspended") || t.contains("right now") {
            bits.append("Pushes you to hurry")
            n += 16
        }
        if t.contains("verify") && (t.contains("account") || t.contains("password") || t.contains("ssn") || t.contains("social security")) {
            bits.append("Asks you to verify an account")
            n += 24
        }
        if t.contains("http://") || t.contains("bit.ly") || t.contains("tinyurl") {
            bits.append("Has a short or bare link")
            n += 12
        }
        if t.contains("you won") || t.contains("prize") || t.contains("congratulations") {
            bits.append("Prize wording")
            n += 18
        }
        if (t.contains("code") || t.contains("otp") || t.contains("one-time")) && (t.contains("send") || t.contains("reply") || t.contains("share")) {
            bits.append("Wants a code you were texted")
            n += 20
        }
        if raw.trimmingCharacters(in: .whitespacesAndNewlines).count < 8 {
            n = 0
            bits = []
        }
        if n > 100 { n = 100 }
        scamScore = n
        scamBits = bits
    }

    func homeFromPress() {
        home = spot
        UserDefaults.standard.set(spot.latitude, forKey: "north.homeLat")
        UserDefaults.standard.set(spot.longitude, forKey: "north.homeLon")
        going = ""
        destName = "Home"
        keepNote()
        maybeRoute(force: true)
    }

    func maybeRoute(force: Bool) {
        if routeBusy { return }
        if !force && routedFrom.latitude != 0 {
            if meters(spot, routedFrom) < 220 && going == lastGoingRouted { return }
        }
        routeBusy = true
        lastGoingRouted = going
        let here = spot
        let typed = going
        Task { await self.buildRoute(here, typed) }
    }

    func buildRoute(_ here: CLLocationCoordinate2D, _ typed: String) async {
        var dest = home
        var name = "Home"
        let clean = typed.trimmingCharacters(in: .whitespacesAndNewlines)
        if !clean.isEmpty && clean.lowercased() != "home" {
            let q = clean.lowercased().contains("ga") ? clean : clean + ", GA"
            if let c = await lookup(q) {
                dest = c
                name = clean
            }
        }
        destName = name
        let req = MKDirections.Request()
        req.source = MKMapItem(placemark: MKPlacemark(coordinate: here))
        req.destination = MKMapItem(placemark: MKPlacemark(coordinate: dest))
        req.transportType = .automobile
        let dirs = MKDirections(request: req)
        let resp = try? await dirs.calculate()
        if let line = resp?.routes.first {
            let poly = line.polyline
            let n = poly.pointCount
            if n > 1 {
                var buf = Array(repeating: CLLocationCoordinate2D(), count: n)
                poly.getCoordinates(&buf, range: NSRange(location: 0, length: n))
                route = buf
                routeIsLive = true
                pathSpan = 0
                miles = line.distance / 1609.344
                let mins = Int((line.expectedTravelTime / 60).rounded())
                minutes = mins < 1 ? 1 : mins
                routedFrom = here
                walkedAlong(buf)
                score(buf)
            }
        }
        routeBusy = false
    }

    func walkedAlong(_ line: [CLLocationCoordinate2D]) {
        if line.isEmpty { walked = 0; return }
        var bestI = 0
        var bestD = 1e12
        var i = 0
        while i < line.count {
            let d = meters(spot, line[i])
            if d < bestD {
                bestD = d
                bestI = i
            }
            i += 1
        }
        var along = 0.0
        if bestI > 0 {
            var k = 1
            while k <= bestI {
                along += meters(line[k - 1], line[k])
                k += 1
            }
        }
        walked = along / 1609.344
    }

    func score(_ line: [CLLocationCoordinate2D]) {
        if line.count < 2 { return }
        var seen = Set<String>()
        var high = 0
        var mid = 0
        var low = 0
        var notes: [String] = []
        var i = 0
        while i < line.count {
            let p = line[i]
            for pin in offenders {
                let key = pin.title + "|" + pin.detail
                if seen.contains(key) { continue }
                let d = meters(p, pin.coord)
                let close = d < 240 || (d < 520 && pin.band == "high")
                if !close { continue }
                seen.insert(key)
                if pin.band == "high" { high += 1 }
                else if pin.band == "mid" { mid += 1 }
                else { low += 1 }
                if notes.count < 6 {
                    notes.append(pin.band + " pin " + String(format: "%.2f", d / 1609.344) + " mi off the route, " + pin.title)
                }
            }
            i += 3
        }
        if let last = line.last {
            for pin in offenders {
                let key = pin.title + "|" + pin.detail
                if seen.contains(key) { continue }
                let d = meters(last, pin.coord)
                if d < 240 || (d < 520 && pin.band == "high") {
                    seen.insert(key)
                    if pin.band == "high" { high += 1 }
                    else if pin.band == "mid" { mid += 1 }
                    else { low += 1 }
                    if notes.count < 6 {
                        notes.append(pin.band + " pin " + String(format: "%.2f", d / 1609.344) + " mi off the route, " + pin.title)
                    }
                }
            }
        }
        var s = 100 - high * 6 - mid * 3 - low
        if s > 97 { s = 97 }
        if s < 54 { s = 54 }
        safe = s
        routeNotes = notes
        for a in ambers {
            routeNotes.append("Amber bulletin: " + a.title)
        }
    }

    func pullRegistry() async {
        if let cached = loadRowCache(), !cached.isEmpty {
            await draw(cached)
        }
        guard let url = URL(string: "https://state.sor.gbi.ga.gov/SORT_PUBLIC/sor.csv") else { return }
        var req = URLRequest(url: url)
        req.timeoutInterval = 45
        guard let (data, resp) = try? await URLSession.shared.data(for: req) else { return }
        if let http = resp as? HTTPURLResponse, http.statusCode != 200 { return }
        let text = String(decoding: data, as: UTF8.self)
        let rows = await Task.detached { Pocket.rowsFrom(text) }.value
        if rows.isEmpty { return }
        saveRowCache(rows)
        await draw(rows)
        await pullAmber()
    }

    func draw(_ rows: [Reg]) async {
        if rows.isEmpty { return }
        offenders = []
        usingLive = true
        pins = ambers
        for row in rows {
            guard let c = await lookup(row.addr) else { continue }
            if c.latitude < 34.00 || c.latitude > 34.48 || c.longitude < -84.50 || c.longitude > -83.90 {
                spots[row.addr] = (0, 0)
                saveSpots()
                continue
            }
            let j = nudge(row.name)
            let pin = Pin(lat: c.latitude + j.0, lon: c.longitude + j.1, band: row.band, title: row.name, detail: row.detail)
            offenders.append(pin)
            pins = offenders + ambers
        }
        if routeIsLive { score(route) }
    }

    func pullAmber() async {
        guard let url = URL(string: "https://gbi.georgia.gov/rss.xml") else { return }
        guard let (data, _) = try? await URLSession.shared.data(from: url) else { return }
        let text = String(decoding: data, as: UTF8.self)
        let parts = text.components(separatedBy: "<item>")
        var found: [(String, String)] = []
        var i = 1
        while i < parts.count {
            let chunk = parts[i]
            i += 1
            let title = grab(chunk, "title")
            let desc = grab(chunk, "description")
            let blob = (title + " " + desc).lowercased()
            if blob.contains("amber alert") || blob.contains("levi's call") || blob.contains("levi’s call") || blob.contains("levis call") {
                found.append((title, desc))
            }
            if found.count >= 4 { break }
        }
        var next: [Pin] = []
        for item in found {
            let blob = item.0 + " " + item.1
            let place = guessPlace(blob)
            if place.isEmpty { continue }
            guard let c = await lookup(place) else { continue }
            next.append(Pin(lat: c.latitude, lon: c.longitude, band: "amber", title: item.0, detail: item.1))
        }
        ambers = next
        if usingLive {
            pins = offenders + ambers
        }
        if routeIsLive { score(route) }
    }

    func guessPlace(_ blob: String) -> String {
        let t = blob.lowercased()
        if t.contains("forsyth") || t.contains("cumming") {
            return "Cumming, GA"
        }
        return ""
    }

    func grab(_ s: String, _ tag: String) -> String {
        let open = "<" + tag + ">"
        let close = "</" + tag + ">"
        guard let a = s.range(of: open), let b = s.range(of: close), a.upperBound <= b.lowerBound else { return "" }
        var t = String(s[a.upperBound..<b.lowerBound])
        if let c0 = t.range(of: "<![CDATA[") {
            t = String(t[c0.upperBound...])
            if let end = t.range(of: "]]>") {
                t = String(t[..<end.lowerBound])
            }
        }
        t = t.replacingOccurrences(of: "&amp;", with: "&")
        t = t.replacingOccurrences(of: "&#039;", with: "'")
        t = t.replacingOccurrences(of: "&quot;", with: "\"")
        return t.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    func lookup(_ addr: String) async -> CLLocationCoordinate2D? {
        if let hit = spots[addr] {
            if hit.0 == 0 && hit.1 == 0 { return nil }
            return CLLocationCoordinate2D(latitude: hit.0, longitude: hit.1)
        }
        while geoBusy {
            try? await Task.sleep(nanoseconds: 200_000_000)
        }
        geoBusy = true
        let g = CLGeocoder()
        let marks = try? await g.geocodeAddressString(addr)
        let c = marks?.first?.location?.coordinate
        if let c {
            spots[addr] = (c.latitude, c.longitude)
        } else {
            spots[addr] = (0, 0)
        }
        saveSpots()
        try? await Task.sleep(nanoseconds: 1_150_000_000)
        geoBusy = false
        return c
    }

    func nudge(_ name: String) -> (Double, Double) {
        var h = 0
        for ch in name.unicodeScalars {
            h = (h * 33 + Int(ch.value)) & 0x7fffffff
        }
        let jlat = Double((h % 7) - 3) * 0.00012
        let jlon = Double(((h / 7) % 7) - 3) * 0.00012
        return (jlat, jlon)
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

    func meters(_ a: CLLocationCoordinate2D, _ b: CLLocationCoordinate2D) -> Double {
        let r = 6371000.0
        let p1 = a.latitude * .pi / 180
        let p2 = b.latitude * .pi / 180
        let dp = (b.latitude - a.latitude) * .pi / 180
        let dl = (b.longitude - a.longitude) * .pi / 180
        let h = sin(dp / 2) * sin(dp / 2) + cos(p1) * cos(p2) * sin(dl / 2) * sin(dl / 2)
        return 2 * r * asin(min(1, sqrt(h)))
    }

    func cacheFile(_ name: String) -> URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent(name)
    }

    func loadSpotCache() {
        let url = cacheFile("forsyth-spots.json")
        guard let data = try? Data(contentsOf: url) else { return }
        guard let raw = try? JSONDecoder().decode([String: [Double]].self, from: data) else { return }
        for (k, v) in raw {
            if v.count >= 2 { spots[k] = (v[0], v[1]) }
        }
    }

    func saveSpots() {
        var raw: [String: [Double]] = [:]
        for (k, v) in spots { raw[k] = [v.0, v.1] }
        if let data = try? JSONEncoder().encode(raw) {
            try? data.write(to: cacheFile("forsyth-spots.json"))
        }
    }

    func loadRowCache() -> [Reg]? {
        let url = cacheFile("forsyth-rows.json")
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode([Reg].self, from: data)
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
