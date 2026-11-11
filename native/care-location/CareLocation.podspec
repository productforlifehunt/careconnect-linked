require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
Pod::Spec.new do |s|
  s.name = 'CareLocation'
  s.version = package['version']
  s.summary = package['description']
  s.license = { :type => 'Proprietary' }
  s.homepage = 'https://careconnect-linked.lovable.app'
  s.author = 'CareConnect'
  s.source = { :git => 'https://github.com/productforlifehunt/careconnect-linked.git', :tag => package['version'] }
  s.source_files = 'ios/Sources/**/*.{swift,h,m}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor', '~> 8.0'
  s.frameworks = 'CoreLocation', 'CoreMotion'
  s.swift_version = '5.9'
end