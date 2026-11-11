# CareLocation (iOS / Capacitor 8)

Repository-local Swift plugin using public CoreLocation and CoreMotion APIs; no commercial SDK.

## Implemented source

- One-shot location: latitude/longitude, horizontal/vertical accuracy, altitude, course/course accuracy, speed/speed accuracy, acquisition timestamp, simulated/accessory source flags.
- Opt-in foreground/background location session, significant-change monitoring with Always permission, system visit callbacks.
- Core Motion activity: stationary, walking, running, cycling, automotive, unknown. Denied/unavailable/low-confidence activity stays unknown.
- Battery percentage/charging on native position samples.
- Circular native region monitoring (iOS limit: 20 total per app); exact CCT214 radius/coordinates, without polygon approximation.
- Atomic, protected on-device pending position queue; confirmation removes only successfully persisted sample sequence numbers.
- Existing shared agent rechecks CCT258 sharing flags, uses the same CCT213/REL165 write path, and preserves acquisition time on delayed writes. Web and Android retain their existing location APIs.

## Native build integration

The root package declares the local plugin and `@capacitor/ios`. Both Swift Package Manager and CocoaPods manifests are provided.
On a macOS/Xcode machine:

1. Install repository dependencies with Yarn.
2. The repository now contains a CLI-generated iOS app under `ios/`, with the custom plugin detected in its generated SPM dependencies and class list.
3. The app target's Info.plist includes `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, and `NSMotionUsageDescription`, with Simplified Chinese localized strings.
4. Background location mode is already enabled (`UIBackgroundModes` contains `location`).
5. Run `yarn exec cap sync ios`, then build/sign in Xcode and test on a physical iPhone.

The native app loads the existing published HTTPS app, not the obsolete Lovable project address. Publish updated web code before testing that hosted shell, or point a development shell at a matching deployed revision explicitly.

## Honest limitations / acceptance pending

- The iOS project is generated and plugin discovery verified, but Xcode/macOS is unavailable in the current sandbox; Swift source has **not** been compiled or executed. JavaScript tests are not native compilation evidence. Existing App/Geolocation/notification plugins still declare Capacitor 7; their full SPM resolution/compilation on Capacitor 8 is not verified.
- A suspended webview cannot run the WordPress JavaScript pipeline. Background fixes persist natively; they upload when the webview can run, including foreground resume. **There is no guaranteed real-time server upload while suspended.** Adding that requires a caller-verified native upload endpoint and secure session handling; this implementation does not embed passwords or send anonymous locations.
- Pending locations are cleared at sharing-agent initialization/sharing-off/sign-out to prevent another account inheriting locations. They survive suspension in the same session, not a new login/app session.
- Force-quitting, reboot, iOS termination, denied/reduced permissions and battery restrictions can interrupt tracking. No claim of Life360-equivalent reliability or system-relaunch upload.
- CoreLocation provides circular regions only. Polygon and scheduled zones continue existing point-in-polygon/time evaluation when samples are synchronized. Excess/oversize circles report errors rather than silently losing/altering zones.
- Vertical/course/speed accuracies, source flags and visit event details are exposed by the bridge but have no dictionary-backed CCT213 columns; not silently stuffed into unrelated fields. Existing CCT213 fields persist position, speed, heading, altitude, motion, time and battery. No new CCT/REL.
- iOS App Store privacy disclosures and localized permission strings remain part of native release acceptance.

## Test checklist on real iPhone

- Grant/deny When In Use, upgrade/deny Always, grant/deny Motion, precise/reduced location.
- Verify actual readings and CCT213 + REL165 readback, same account on web/native.
- Share on, lock phone/walk, resume, confirm pending samples preserve original timestamps; network failure retains pending data.
- Stop sharing/log out, verify collection stops and no queued coordinates cross accounts.
- Walk/drive/stationary activity, native battery, circular entry/exit, visit arrival/departure.
- Verify >20 circles errors visibly in diagnostics; polygons/schedules are not changed.