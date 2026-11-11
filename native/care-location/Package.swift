// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CareconnectLocation",
    platforms: [.iOS(.v15)],
    products: [.library(name: "CareconnectLocation", targets: ["CareLocationPlugin"])],
    dependencies: [.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "8.0.0"..<"9.0.0")],
    targets: [.target(name: "CareLocationPlugin", dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")], path: "ios/Sources/CareLocationPlugin")]
)