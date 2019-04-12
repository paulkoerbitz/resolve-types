# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
 - Coding style

## [0.0.1] - 2019-04-12
### Added
 - Inspect method (similar to `resolve-types` but not lazy and with more usable API)
 - Tests for option and inspect functions
 - Travis CI

### Changed
 - `setOptions` now returns the options object
 - Failures throw errors instead of returning diagnostics, obfuscating the API

### Fixed
 - `getOptions` now correctly parses project configuration (f0804d9)

## [0.0.0] - 2019-04-04
### Added
- Initialized on fork of [resolve-types](https://github.com/paulkoerbitz/resolve-types)
- Template based on [package-template v0.1.0](https://github.com/AckeeCZ/package-template/tree/v0.1.0)

[Unreleased]: https://github.com/grissius/intspector/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/grissius/intspector/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/grissius/intspector/compare/76d2238...v0.0.0
