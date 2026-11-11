import Foundation
import Capacitor
import CoreLocation
import CoreMotion
import UIKit

@objc(CareLocationPlugin)
public class CareLocationPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "CareLocationPlugin"
    public let jsName = "CareLocation"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPending", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "acknowledge", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearPending", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setGeofences", returnType: CAPPluginReturnPromise)
    ]

    private var manager: CLLocationManager?
    private let motion = CMMotionActivityManager()
    private var activity = "unknown"
    private var tracking = false
    private var wantsBackground = false
    private var wantsMotion = false
    private var wantsVisits = false
    private var askedAlways = false
    private var pendingFixes: [CAPPluginCall] = []
    private var starting: CAPPluginCall?
    private var positions: [[String: Any]] = []
    private var sequence: Int64 = 0
    private var lastQueuedAt: TimeInterval = 0
    private let sampleInterval: TimeInterval = 180

    private var queueURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("care-location-pending.json")
    }

    public override func load() {
        DispatchQueue.main.async {
            let manager = CLLocationManager()
            manager.delegate = self
            manager.desiredAccuracy = kCLLocationAccuracyBest
            manager.distanceFilter = 25
            manager.pausesLocationUpdatesAutomatically = false
            self.manager = manager
            UIDevice.current.isBatteryMonitoringEnabled = true
            do {
                if FileManager.default.fileExists(atPath: self.queueURL.path) {
                    let data = try Data(contentsOf: self.queueURL)
                    let saved = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    self.positions = saved?["positions"] as? [[String: Any]] ?? []
                    self.sequence = (saved?["sequence"] as? NSNumber)?.int64Value ?? 0
                }
            } catch {
                self.notifyListeners("error", data: ["message": "Cannot read pending locations: \(error.localizedDescription)"])
            }
        }
    }

    private func valid(_ value: Double, minimum: Double = 0) -> Any {
        value.isFinite && value >= minimum ? value : NSNull()
    }

    private func permissionData() -> [String: Any] {
        let status = manager?.authorizationStatus ?? .notDetermined
        let location: String
        switch status {
        case .authorizedAlways: location = "always"
        case .authorizedWhenInUse: location = "whenInUse"
        case .denied: location = "denied"
        case .restricted: location = "restricted"
        default: location = "prompt"
        }
        let motionStatus: String
        switch CMMotionActivityManager.authorizationStatus() {
        case .authorized: motionStatus = "granted"
        case .denied, .restricted: motionStatus = "denied"
        default: motionStatus = "prompt"
        }
        return ["location": location, "accuracy": manager?.accuracyAuthorization == .fullAccuracy ? "full" : "reduced", "motion": motionStatus]
    }

    @objc func getPermissions(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(self.permissionData()) }
    }

    @objc func getCurrentPosition(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let manager = self.manager else { call.reject("Location manager unavailable"); return }
            guard manager.authorizationStatus != .denied && manager.authorizationStatus != .restricted else {
                call.reject("Location permission denied"); return
            }
            self.pendingFixes.append(call)
            if manager.authorizationStatus == .notDetermined { manager.requestWhenInUseAuthorization() }
            else { manager.requestLocation() }
            let timeout = max(1, Double(call.getInt("timeout") ?? 10000) / 1000)
            DispatchQueue.main.asyncAfter(deadline: .now() + timeout) {
                if let index = self.pendingFixes.firstIndex(where: { $0 === call }) {
                    self.pendingFixes.remove(at: index)
                    call.reject("Location request timed out")
                }
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let manager = self.manager else { call.reject("Location manager unavailable"); return }
            guard self.starting == nil else { call.reject("Location permission request in progress"); return }
            guard manager.authorizationStatus != .denied && manager.authorizationStatus != .restricted else {
                call.reject("Location permission denied"); return
            }
            self.wantsBackground = call.getBool("background") ?? false
            self.wantsMotion = call.getBool("collectMotion") ?? true
            self.wantsVisits = call.getBool("collectVisits") ?? true
            manager.distanceFilter = max(0, call.getDouble("distanceFilter") ?? 25)
            if self.wantsBackground {
                let modes = Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes") as? [String] ?? []
                guard modes.contains("location") else { call.reject("UIBackgroundModes must include location"); return }
                guard Bundle.main.object(forInfoDictionaryKey: "NSLocationAlwaysAndWhenInUseUsageDescription") != nil else {
                    call.reject("Missing Always location permission description"); return
                }
            }
            if self.wantsMotion && Bundle.main.object(forInfoDictionaryKey: "NSMotionUsageDescription") == nil {
                call.reject("Missing motion permission description"); return
            }
            self.tracking = true
            if manager.authorizationStatus == .notDetermined {
                self.starting = call
                manager.requestWhenInUseAuthorization()
            } else {
                self.beginTracking()
                call.resolve(["background": manager.allowsBackgroundLocationUpdates])
            }
        }
    }

    private func beginTracking() {
        guard tracking, let manager = manager else { return }
        let allowed = manager.authorizationStatus == .authorizedAlways || manager.authorizationStatus == .authorizedWhenInUse
        guard allowed else { return }
        // When-in-use can continue an explicitly started session with the blue indicator.
        // Always is needed for system-relaunched significant-change/visit/region delivery.
        manager.allowsBackgroundLocationUpdates = wantsBackground
        manager.showsBackgroundLocationIndicator = wantsBackground
        manager.startUpdatingLocation()
        if wantsBackground && manager.authorizationStatus == .authorizedAlways {
            manager.startMonitoringSignificantLocationChanges()
            if wantsVisits { manager.startMonitoringVisits() }
        }
        if wantsBackground && manager.authorizationStatus == .authorizedWhenInUse && !askedAlways {
            askedAlways = true
            manager.requestAlwaysAuthorization()
        }
        if wantsMotion && CMMotionActivityManager.isActivityAvailable() {
            motion.startActivityUpdates(to: .main) { [weak self] update in
                guard let self = self, let update = update else { return }
                if update.confidence == .low { self.activity = "unknown" }
                else if update.automotive { self.activity = "automotive" }
                else if update.cycling { self.activity = "cycling" }
                else if update.running { self.activity = "running" }
                else if update.walking { self.activity = "walking" }
                else if update.stationary { self.activity = "stationary" }
                else { self.activity = "unknown" }
            }
        }
    }

    private func stopTracking() {
        tracking = false
        wantsBackground = false
        manager?.stopUpdatingLocation()
        manager?.stopMonitoringSignificantLocationChanges()
        manager?.stopMonitoringVisits()
        manager?.allowsBackgroundLocationUpdates = false
        for region in manager?.monitoredRegions ?? [] where region.identifier.hasPrefix("care-zone:") {
            manager?.stopMonitoring(for: region)
        }
        motion.stopActivityUpdates()
        activity = "unknown"
        starting?.reject("Location tracking stopped")
        starting = nil
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.stopTracking(); call.resolve() }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        notifyListeners("permissions", data: permissionData())
        if manager.authorizationStatus == .denied || manager.authorizationStatus == .restricted {
            stopTracking()
            let calls = pendingFixes
            pendingFixes.removeAll()
            calls.forEach { $0.reject("Location permission denied") }
            return
        }
        if manager.authorizationStatus == .authorizedAlways || manager.authorizationStatus == .authorizedWhenInUse {
            beginTracking()
            starting?.resolve(["background": manager.allowsBackgroundLocationUpdates])
            starting = nil
            if !pendingFixes.isEmpty { manager.requestLocation() }
        }
    }

    private func payload(_ location: CLLocation) -> [String: Any] {
        var value: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": valid(location.horizontalAccuracy),
            "altitude": location.verticalAccuracy >= 0 ? location.altitude as Any : NSNull(),
            "altitudeAccuracy": valid(location.verticalAccuracy),
            "heading": valid(location.course),
            "headingAccuracy": valid(location.courseAccuracy),
            "speed": valid(location.speed),
            "speedAccuracy": valid(location.speedAccuracy),
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
            "moving_type": activity,
            "battery_level": UIDevice.current.batteryLevel >= 0 ? Double(UIDevice.current.batteryLevel) * 100 : NSNull(),
            "phone_is_charging": UIDevice.current.batteryState == .unknown ? NSNull() : (UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full),
            "simulated": NSNull(), "accessory": NSNull()
        ]
        if let source = location.sourceInformation {
            value["simulated"] = source.isSimulatedBySoftware
            value["accessory"] = source.isProducedByAccessory
        }
        return value
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        for location in locations where CLLocationCoordinate2DIsValid(location.coordinate) && location.horizontalAccuracy >= 0 {
            let value = payload(location)
            let calls = pendingFixes
            pendingFixes.removeAll()
            calls.forEach { $0.resolve(value) }
            if tracking {
                if location.timestamp.timeIntervalSince1970 - lastQueuedAt >= sampleInterval {
                    sequence += 1
                    var queued = value
                    queued["sequence"] = sequence
                    positions.append(queued)
                    do {
                        try saveQueue()
                        lastQueuedAt = location.timestamp.timeIntervalSince1970
                    } catch {
                        positions.removeLast()
                        notifyListeners("error", data: ["message": "Cannot persist location: \(error.localizedDescription)"])
                    }
                }
                notifyListeners("position", data: value)
            }
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // A temporary missing GPS fix should not abort ongoing tracking.
        if let error = error as? CLError, error.code == .locationUnknown { return }
        let calls = pendingFixes
        pendingFixes.removeAll()
        calls.forEach { $0.reject(error.localizedDescription) }
        notifyListeners("error", data: ["message": error.localizedDescription])
    }

    private func saveQueue() throws {
        let directory = queueURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let data = try JSONSerialization.data(withJSONObject: ["sequence": sequence, "positions": positions])
        try data.write(to: queueURL, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    @objc func getPending(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(["positions": self.positions]) }
    }

    @objc func acknowledge(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let sequences = Set((call.getArray("sequences") ?? []).compactMap { ($0 as? NSNumber)?.int64Value })
            let previous = self.positions
            self.positions.removeAll { sequences.contains(($0["sequence"] as? NSNumber)?.int64Value ?? -1) }
            do { try self.saveQueue(); call.resolve() }
            catch { self.positions = previous; call.reject("Cannot acknowledge locations", nil, error) }
        }
    }

    @objc func clearPending(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let previous = self.positions
            self.positions.removeAll()
            self.lastQueuedAt = 0
            do { try self.saveQueue(); call.resolve() }
            catch { self.positions = previous; call.reject("Cannot clear pending locations", nil, error) }
        }
    }

    @objc func setGeofences(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let manager = self.manager else { call.reject("Location manager unavailable"); return }
            guard CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else { call.reject("Region monitoring unavailable"); return }
            guard manager.authorizationStatus == .authorizedAlways else { call.reject("Region monitoring requires Always location permission"); return }
            let input = call.getArray("fences") ?? []
            let unrelated = manager.monitoredRegions.filter { !$0.identifier.hasPrefix("care-zone:") }.count
            guard input.count + unrelated <= 20 else { call.reject("iOS supports at most 20 monitored regions per app"); return }
            var desired: [CLCircularRegion] = []
            for item in input {
                guard let item = item as? [String: Any], let id = item["identifier"] as? String,
                      let lat = item["latitude"] as? Double, let lng = item["longitude"] as? Double,
                      let radius = item["radius"] as? Double,
                      CLLocationCoordinate2DIsValid(CLLocationCoordinate2D(latitude: lat, longitude: lng)),
                      radius > 0, radius <= manager.maximumRegionMonitoringDistance else {
                    call.reject("Invalid or unsupported circular region"); return
                }
                let region = CLCircularRegion(center: CLLocationCoordinate2D(latitude: lat, longitude: lng), radius: radius, identifier: "care-zone:" + id)
                region.notifyOnEntry = item["notifyOnEntry"] as? Bool ?? true
                region.notifyOnExit = item["notifyOnExit"] as? Bool ?? true
                desired.append(region)
            }
            for region in manager.monitoredRegions where region.identifier.hasPrefix("care-zone:") {
                manager.stopMonitoring(for: region)
            }
            desired.forEach { manager.startMonitoring(for: $0) }
            call.resolve()
        }
    }

    public func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        regionEvent(region, transition: "enter")
    }
    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        regionEvent(region, transition: "exit")
    }
    private func regionEvent(_ region: CLRegion, transition: String) {
        guard tracking, region.identifier.hasPrefix("care-zone:") else { return }
        lastQueuedAt = 0
        manager?.requestLocation()
        notifyListeners("geofence", data: ["identifier": String(region.identifier.dropFirst("care-zone:".count)), "transition": transition])
    }
    public func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        notifyListeners("error", data: ["message": error.localizedDescription])
    }
    public func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {
        guard tracking else { return }
        lastQueuedAt = 0
        manager.requestLocation()
        notifyListeners("visit", data: [
            "latitude": visit.coordinate.latitude, "longitude": visit.coordinate.longitude,
            "accuracy": visit.horizontalAccuracy,
            "arrival": visit.arrivalDate == .distantPast ? NSNull() : visit.arrivalDate.timeIntervalSince1970 * 1000,
            "departure": visit.departureDate == .distantFuture ? NSNull() : visit.departureDate.timeIntervalSince1970 * 1000
        ])
    }
}