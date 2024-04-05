# Changelog

## [0.6.10](https://github.com/googlemaps/extended-component-library/compare/v0.6.9...v0.6.10) (2024-04-05)


### Bug Fixes

* change deprecated place field name `openingHours` to `regularOpeningHours` ([3d42bdf](https://github.com/googlemaps/extended-component-library/commit/3d42bdf9e60d0d0bc2a4d2e64c05675fe5790236))

## [0.6.9](https://github.com/googlemaps/extended-component-library/compare/v0.6.8...v0.6.9) (2024-03-26)


### Bug Fixes

* reduce loading latency of lightbox photos by capping width/height to window ([29e02ea](https://github.com/googlemaps/extended-component-library/commit/29e02eab8439c110c86ba13c088b4223a622eb5a))
* resolves issue of font-family CSS variable not working on Place Picker ([#191](https://github.com/googlemaps/extended-component-library/issues/191)) ([b45066f](https://github.com/googlemaps/extended-component-library/commit/b45066f6fc323748fd14bbf727728f810f271754))

## [0.6.8](https://github.com/googlemaps/extended-component-library/compare/v0.6.7...v0.6.8) (2024-03-13)


### Bug Fixes

* ensure place photos are requested with explicit width & height ([87ae0ce](https://github.com/googlemaps/extended-component-library/commit/87ae0ceebdddc16551c0088ddcde083b4300a97e))
* make typings of AuthorAttribution consistent with JS API ([f7b190f](https://github.com/googlemaps/extended-component-library/commit/f7b190f8e872b83bb20e0c3dca7fba101ad1d4cd))

## [0.6.7](https://github.com/googlemaps/extended-component-library/compare/v0.6.6...v0.6.7) (2024-02-23)


### Bug Fixes

* fix "hasWheelchairAccessibleEntrance" boolean field due to API changes ([3df3d09](https://github.com/googlemaps/extended-component-library/commit/3df3d09d78a66de721295b1a9321def86ba5c1fd))

## [0.6.6](https://github.com/googlemaps/extended-component-library/compare/v0.6.5...v0.6.6) (2024-02-21)


### Bug Fixes

* hide route in Store Locator component when origin/dest is unknown ([8399265](https://github.com/googlemaps/extended-component-library/commit/8399265c15f009509af31ac4ba6a698557eb9100))

## [0.6.5](https://github.com/googlemaps/extended-component-library/compare/v0.6.4...v0.6.5) (2024-01-26)


### Bug Fixes

* replace usage of deprecated findPlaceFromQuery with searchByText in Place Picker ([dc83f25](https://github.com/googlemaps/extended-component-library/commit/dc83f2540d144391420a2ffdd99ad392549ba225))

## [0.6.4](https://github.com/googlemaps/extended-component-library/compare/v0.6.3...v0.6.4) (2024-01-04)


### Bug Fixes

* fix issue with location pins not displaying in Store Locator ([fb44403](https://github.com/googlemaps/extended-component-library/commit/fb44403654a5b3206203ba3135bb18027a3a66f3))

## [0.6.3](https://github.com/googlemaps/extended-component-library/compare/v0.6.2...v0.6.3) (2023-12-07)


### Bug Fixes

* allow resetting of Place Picker type to empty value (= all types) ([8fe6b56](https://github.com/googlemaps/extended-component-library/commit/8fe6b56505ca6fbfa63a08ef16fee9204be709cf))

## [0.6.2](https://github.com/googlemaps/extended-component-library/compare/v0.6.1...v0.6.2) (2023-11-20)


### Bug Fixes

* prevent excessive zoom in store locator ([2394230](https://github.com/googlemaps/extended-component-library/commit/2394230cf7f130624c83a1465ab99335f42ebebd))
* store locator listings and map options should not be attributes ([3dc5170](https://github.com/googlemaps/extended-component-library/commit/3dc517076cd93aef91a768f41730dfb3fe116b95))

## [0.6.1](https://github.com/googlemaps/extended-component-library/compare/v0.6.0...v0.6.1) (2023-11-13)


### Bug Fixes

* clean up Map ID in a generated Quick Builder configuration ([bb25e4d](https://github.com/googlemaps/extended-component-library/commit/bb25e4d4f43145c323ed01a8c0deb43503b9313a))

## [0.6.0](https://github.com/googlemaps/extended-component-library/compare/v0.5.0...v0.6.0) (2023-11-10)


### Features

* add Store Locator component ([b2921f8](https://github.com/googlemaps/extended-component-library/commit/b2921f897814c7063d7880ed3f8ba8ab95a4fdf8))
* make divider/button outline color customizable ([6e7f0cb](https://github.com/googlemaps/extended-component-library/commit/6e7f0cb658f383289465339f417f0d568dbee777))
* make Place Opening Hours colors customizable ([66c5d88](https://github.com/googlemaps/extended-component-library/commit/66c5d8898aa41634d281b28f77d22c80fb6e5814))


### Bug Fixes

* adjust photo carousel margins in Place Overview ([3b03f39](https://github.com/googlemaps/extended-component-library/commit/3b03f3965151fda9da715f2b9ad3ed3fe2919ce2))

## [0.5.0](https://github.com/googlemaps/extended-component-library/compare/v0.4.3...v0.5.0) (2023-11-08)


### Features

* add helper component for Address Validation API ([b3b07e9](https://github.com/googlemaps/extended-component-library/commit/b3b07e96211ecc37192ac157d55c0c690ba935b0))
* support aria-label attribute on Place Field Link ([9676a62](https://github.com/googlemaps/extended-component-library/commit/9676a623c5ddf37169d7a981147171366396de49))


### Bug Fixes

* add role="img" to star rating renderings to support aria-label usage ([b69d8bd](https://github.com/googlemaps/extended-component-library/commit/b69d8bd544fc8943638d77c9e13c113e3aa59e87))
* fix duplicate node in a11y tree when using aria-label on components ([c04dd5e](https://github.com/googlemaps/extended-component-library/commit/c04dd5e834d681e3edb1744edaad9346a9e9e9f3))
* include Routes components in generated React module ([1ed2275](https://github.com/googlemaps/extended-component-library/commit/1ed22750a8a3f501f1de986361e86f0559180657))
* increase color contrast to 4.5:1 for accessibility ([ec6265d](https://github.com/googlemaps/extended-component-library/commit/ec6265dbef35bb547e66b87d183e1844bc482443))

## [0.4.3](https://github.com/googlemaps/extended-component-library/compare/v0.4.2...v0.4.3) (2023-10-13)


### Bug Fixes

* resolve minor styling issue with photo scrollbar in Place Overview ([95e9a6c](https://github.com/googlemaps/extended-component-library/commit/95e9a6c4f08b6efdeb5c26ed17ceed138fec6e75))

## [0.4.2](https://github.com/googlemaps/extended-component-library/compare/v0.4.1...v0.4.2) (2023-09-06)


### Bug Fixes

* have Place Picker update input when performing fallback search ([5533390](https://github.com/googlemaps/extended-component-library/commit/55333902dea8f15325fe3048fd38f705038f7a5f))

## [0.4.1](https://github.com/googlemaps/extended-component-library/compare/v0.4.0...v0.4.1) (2023-09-05)


### Bug Fixes

* allow omitting the destination pin in Route Overview ([b323474](https://github.com/googlemaps/extended-component-library/commit/b3234746f0b8120b95fdb7f4b2622c7eb79e8edc))
* prevent closing overlay layout on escape when photo lightbox is open ([4eaa19c](https://github.com/googlemaps/extended-component-library/commit/4eaa19c4761b7cea6491c5af39ccc6b8a8d26bbc))


### Performance Improvements

* use high-detail path in Route Polyline ([2720c46](https://github.com/googlemaps/extended-component-library/commit/2720c46239f65de445b392431807cfc4b0309b3a))

## [0.4.0](https://github.com/googlemaps/extended-component-library/compare/v0.3.1...v0.4.0) (2023-08-18)


### Features

* add route components ([6dea995](https://github.com/googlemaps/extended-component-library/commit/6dea99571eb55a67d1700d206c3dea13ed3b3492))
* adjust route component property nullability ([c64db7b](https://github.com/googlemaps/extended-component-library/commit/c64db7b0b5d22030b6866b927ec6aca38700fb2c))


### Bug Fixes

* place details API should not request attributions ([907add7](https://github.com/googlemaps/extended-component-library/commit/907add786bbbe583a31b51afca9e2b22139d1686))

## [0.3.1](https://github.com/googlemaps/extended-component-library/compare/v0.3.0...v0.3.1) (2023-08-15)


### Bug Fixes

* fix Place Data Provider behavior when fetching a Place from a Place ID ([e14dfb2](https://github.com/googlemaps/extended-component-library/commit/e14dfb2036d0e047c48265c9186d5a2b294a8f85))
* make Place Picker compatible with stable SDK ([0848017](https://github.com/googlemaps/extended-component-library/commit/0848017a67701691199e905c5905fac18c116c6d))

## [0.3.0](https://github.com/googlemaps/extended-component-library/compare/v0.2.2...v0.3.0) (2023-08-09)


### Features

* improve Places components' compatibility with GA versions of the Maps JS SDK ([08a269b](https://github.com/googlemaps/extended-component-library/commit/08a269bc16dfcf270ee69800db1974752227a2d7))


### Bug Fixes

* fix an internal issue with photos ([ba61ae5](https://github.com/googlemaps/extended-component-library/commit/ba61ae5e14d26d8d232db0528adf2029d03ac636))

## [0.2.2](https://github.com/googlemaps/extended-component-library/compare/v0.2.1...v0.2.2) (2023-07-27)


### Bug Fixes

* fix broken photo gallery and reviews widgets ([ab25721](https://github.com/googlemaps/extended-component-library/commit/ab2572151b8e6d0a41690cadcea5d52fe6c47b3b))

## [0.2.1](https://github.com/googlemaps/extended-component-library/compare/v0.2.0...v0.2.1) (2023-07-13)


### Performance Improvements

* switch to SPDX license identifiers ([2a05694](https://github.com/googlemaps/extended-component-library/commit/2a05694f8e5946c936c4dec1d6b03d2ca10ef9c7))

## [0.2.0](https://github.com/googlemaps/extended-component-library/compare/v0.1.4...v0.2.0) (2023-07-10)


### Features

* add apiKey as alias for key property in API Loader ([d4feb17](https://github.com/googlemaps/extended-component-library/commit/d4feb177e1730d898fc8eeffeecde1c6b214b725))
* add script to auto-generate React wrappers for Web Components ([40b4c8f](https://github.com/googlemaps/extended-component-library/commit/40b4c8f741ec304f1ff97977055ded66db75a8f3))
* add setStringLiterals to allow for custom setting of translated literals ([ef59c47](https://github.com/googlemaps/extended-component-library/commit/ef59c472ec602ba143f89e7ec566a8d8652464ce))
* expose utility to customize string literals ([46d4960](https://github.com/googlemaps/extended-component-library/commit/46d49604705416a6cdec2e909d3654441828a297))

## [0.1.4](https://github.com/googlemaps/extended-component-library/compare/v0.1.3...v0.1.4) (2023-06-21)


### Bug Fixes

* declare JS API bootstrap params as external ([7ce41b8](https://github.com/googlemaps/extended-component-library/commit/7ce41b864ed98b9fccf3ab7032484e0a1d37af39))
* prevent Directions Controller unit tests from sharing state ([c85bec1](https://github.com/googlemaps/extended-component-library/commit/c85bec1f72bb960567758917ef2a5d8d70ed5688))
* prevent unwanted property renaming ([51d7f41](https://github.com/googlemaps/extended-component-library/commit/51d7f41a177a0c534a1ca65cb39446d31ae64317))


### Performance Improvements

* improve caching/retry behavior of service calls ([2e60fd4](https://github.com/googlemaps/extended-component-library/commit/2e60fd4bc1be46c9ae47176138619ea6071b3edc))

## [0.1.3](https://github.com/googlemaps/extended-component-library/compare/v0.1.2...v0.1.3) (2023-05-16)


### Bug Fixes

* update npm publish action ([90a4024](https://github.com/googlemaps/extended-component-library/commit/90a40245ea69655ba8d2a8101e8a13d15e4ea2a7))

## [0.1.2](https://github.com/googlemaps/extended-component-library/compare/v0.1.1...v0.1.2) (2023-05-16)


### Performance Improvements

* create request/response cache for API services being called multiple times ([82973a3](https://github.com/googlemaps/extended-component-library/commit/82973a331920d8bf604153958f81f125933b07d7))

## 0.1.1 (2023-05-12)


### Bug Fixes

* log error details in console when Place Overview fails to load ([a0f6a61](https://github.com/googlemaps/extended-component-library/commit/a0f6a61f495356b79f0452046f9fef9068b6e3db))
* Move focus when disabling place picker buttons. ([f3460ac](https://github.com/googlemaps/extended-component-library/commit/f3460aceb547f41c571a01bbcd897ab5c9e2ea4d))


### Performance Improvements

* update directions label to work with cached directions requests ([8ccfddf](https://github.com/googlemaps/extended-component-library/commit/8ccfddfe117bd0515d422a05eeb368e5e3df2708))
