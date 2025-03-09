import SwiftUI

struct Shade {
    var page: Color
    var card: Color
    var ink: Color
    var muted: Color
    var rose: Color
    var line: Color
    var blush: Color
    var field: Color
    var emergency: Color
    var red: Color
    var chip: Color
    var icon: Color
    var iconDeep: Color
    var iconSoft: Color
    var north: Color
    var tabOn: Color
    var tabOnInk: Color
    var tabOff: Color
    var grid: Color
    var gridLine: Color
    var route: Color
    var safeInk: Color
    var safeBg: Color
    var track: Color
    var high: Color
    var mid: Color
    var low: Color
    var blue: Color

    static let day = Shade(
        page: .white,
        card: .white,
        ink: Color(red: 0.18, green: 0.14, blue: 0.16),
        muted: Color(red: 0.62, green: 0.53, blue: 0.56),
        rose: Color(red: 0.66, green: 0.45, blue: 0.54),
        line: Color(red: 0.91, green: 0.91, blue: 0.91),
        blush: Color(red: 0.99, green: 0.945, blue: 0.957),
        field: Color(red: 0.99, green: 0.93, blue: 0.95),
        emergency: Color(red: 0.816, green: 0.616, blue: 0.698),
        red: Color(red: 0.906, green: 0.0, blue: 0.043),
        chip: Color(red: 0.851, green: 0.655, blue: 0.733),
        icon: Color(red: 0.835, green: 0.639, blue: 0.718),
        iconDeep: Color(red: 0.576, green: 0.369, blue: 0.455),
        iconSoft: Color(red: 0.89, green: 0.725, blue: 0.796),
        north: Color(red: 0.898, green: 0.667, blue: 0.745),
        tabOn: Color(red: 0.98, green: 0.945, blue: 0.957),
        tabOnInk: Color(red: 0.84, green: 0.45, blue: 0.58),
        tabOff: Color(red: 0.62, green: 0.56, blue: 0.58),
        grid: Color(red: 0.976, green: 0.922, blue: 0.941),
        gridLine: Color(red: 0.93, green: 0.80, blue: 0.84),
        route: Color(red: 0.73, green: 0.47, blue: 0.60),
        safeInk: Color(red: 0.18, green: 0.62, blue: 0.40),
        safeBg: Color(red: 0.86, green: 0.96, blue: 0.90),
        track: Color(red: 0.95, green: 0.90, blue: 0.92),
        high: Color(red: 0.984, green: 0.196, blue: 0.235),
        mid: Color(red: 0.95, green: 0.48, blue: 0.16),
        low: Color(red: 0.96, green: 0.77, blue: 0.24),
        blue: Color(red: 0.17, green: 0.50, blue: 1.0)
    )

    static let night = Shade(
        page: Color(red: 0.09, green: 0.07, blue: 0.08),
        card: Color(red: 0.16, green: 0.13, blue: 0.14),
        ink: Color(red: 0.96, green: 0.93, blue: 0.94),
        muted: Color(red: 0.75, green: 0.66, blue: 0.70),
        rose: Color(red: 0.90, green: 0.70, blue: 0.78),
        line: Color(red: 0.28, green: 0.22, blue: 0.24),
        blush: Color(red: 0.22, green: 0.16, blue: 0.18),
        field: Color(red: 0.24, green: 0.17, blue: 0.20),
        emergency: Color(red: 0.62, green: 0.38, blue: 0.48),
        red: Color(red: 0.906, green: 0.0, blue: 0.043),
        chip: Color(red: 0.62, green: 0.40, blue: 0.50),
        icon: Color(red: 0.55, green: 0.36, blue: 0.44),
        iconDeep: Color(red: 0.42, green: 0.26, blue: 0.33),
        iconSoft: Color(red: 0.48, green: 0.32, blue: 0.40),
        north: Color(red: 0.898, green: 0.667, blue: 0.745),
        tabOn: Color(red: 0.28, green: 0.18, blue: 0.22),
        tabOnInk: Color(red: 0.95, green: 0.72, blue: 0.80),
        tabOff: Color(red: 0.62, green: 0.54, blue: 0.57),
        grid: Color(red: 0.22, green: 0.14, blue: 0.17),
        gridLine: Color(red: 0.38, green: 0.24, blue: 0.29),
        route: Color(red: 0.86, green: 0.60, blue: 0.72),
        safeInk: Color(red: 0.55, green: 0.86, blue: 0.66),
        safeBg: Color(red: 0.16, green: 0.28, blue: 0.22),
        track: Color(red: 0.30, green: 0.22, blue: 0.25),
        high: Color(red: 0.984, green: 0.196, blue: 0.235),
        mid: Color(red: 0.95, green: 0.48, blue: 0.16),
        low: Color(red: 0.96, green: 0.77, blue: 0.24),
        blue: Color(red: 0.35, green: 0.62, blue: 1.0)
    )
}
