# Changelog

## [1.1.9](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.8...v1.1.9) (2026-11-27)


### Bug Fixes

* **accounts:** export WhoAmIResult with the other interfaces ([966c343](https://github.com/tagshelfsrl/alfred-node/commit/966c343299450f18b4104d90a10826fc071a588e))
* **accounts:** return account details from whoAmI instead of the HTTP response ([487b947](https://github.com/tagshelfsrl/alfred-node/commit/487b94770e249a71aabaaa4790f804461efbe089))
* **accounts:** whoAmI returns the account, not the HTTP response ([0ada7de](https://github.com/tagshelfsrl/alfred-node/commit/0ada7dec509ac966692bee16487cdf9907122636))
* **auth:** sign HMAC requests the way Alfred checks them ([346bb73](https://github.com/tagshelfsrl/alfred-node/commit/346bb73a7b2e3b9cacea420d96d648493df15bbc))
* **auth:** sign HMAC requests the way the API verifies them ([69a8e14](https://github.com/tagshelfsrl/alfred-node/commit/69a8e1431b80d2670997a8a6b6bd6d20791c184c))
* **files:** send the field names the API reads on URL upload and return the job ([1c96f77](https://github.com/tagshelfsrl/alfred-node/commit/1c96f77ecf8cee12c11cfb440a8bbaa8253eeada))
* **files:** URL uploads send the right fields and return the job ([95f81c4](https://github.com/tagshelfsrl/alfred-node/commit/95f81c47c8107c6f8e49ffcdb2d195aaa20d357c))

## [1.1.8](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.7...v1.1.8) (2025-10-14)


### Bug Fixes

* correct typo in documentation and add missing return types for session methods ([7df6147](https://github.com/tagshelfsrl/alfred-node/commit/7df61473d3b81e2efe1885e84149d1653deb6e23))
* correct typo in documentation and add missing return types for session methods ([d55583a](https://github.com/tagshelfsrl/alfred-node/commit/d55583a534f50b0398b482b946bcdfbb32c79726))

## [1.1.7](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.6...v1.1.7) (2025-10-10)


### Bug Fixes

* add hasBrokenInputSources property to JobInvalidEvent ([#53](https://github.com/tagshelfsrl/alfred-node/issues/53)) ([d28d011](https://github.com/tagshelfsrl/alfred-node/commit/d28d011d10479f280f06bd141731d9cfe97ce44f))

## [1.1.6](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.5...v1.1.6) (2024-09-14)


### Bug Fixes

* update job result typings. ([#50](https://github.com/tagshelfsrl/alfred-node/issues/50)) ([997a97c](https://github.com/tagshelfsrl/alfred-node/commit/997a97c310838582e291a204cc7292b45f1f1826))

## [1.1.5](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.4...v1.1.5) (2024-09-13)


### Bug Fixes

* trigger release pipeline ([a319f0a](https://github.com/tagshelfsrl/alfred-node/commit/a319f0a827b60845a55287438e6e9f7ac988828a))

## [1.1.4](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.3...v1.1.4) (2024-09-12)


### Bug Fixes

* typing issues and add modular structure for job and file event definition. ([#45](https://github.com/tagshelfsrl/alfred-node/issues/45)) ([5be06f6](https://github.com/tagshelfsrl/alfred-node/commit/5be06f684f0e9b010ff288e38a794ec4c2a18096))

## [1.1.3](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.2...v1.1.3) (2024-05-23)


### Bug Fixes

* move realtime types out of typescript declaration files.  ([#41](https://github.com/tagshelfsrl/alfred-node/issues/41)) ([5573223](https://github.com/tagshelfsrl/alfred-node/commit/557322304334ea5cb1e178b6fe4c0a3c7f162883))
* rename configuration override and set default urls for realtime ([#42](https://github.com/tagshelfsrl/alfred-node/issues/42)) ([d2c0f4e](https://github.com/tagshelfsrl/alfred-node/commit/d2c0f4e658e8d6092eb6bc26c55598b69345e9d1))

## [1.1.2](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.1...v1.1.2) (2024-05-20)


### Bug Fixes

* add comprehensive docs on how to authenticate, upload files and use the realtime engine. ([#37](https://github.com/tagshelfsrl/alfred-node/issues/37)) ([57031c7](https://github.com/tagshelfsrl/alfred-node/commit/57031c7786637dfbb7ae9b00c03fd43759ea9e99))
* release-please-action org name was renamed and updates accordingly ([#39](https://github.com/tagshelfsrl/alfred-node/issues/39)) ([da9af3d](https://github.com/tagshelfsrl/alfred-node/commit/da9af3ddbc24758c84ba35e94fe98d56d907ec69))
* rename alfred-socket-client to alfred-realtime-client and all related variables ([#38](https://github.com/tagshelfsrl/alfred-node/issues/38)) ([6ccba36](https://github.com/tagshelfsrl/alfred-node/commit/6ccba36802501643324b7b4676c97d448b562a6c))
* trigger build release ([af1e06e](https://github.com/tagshelfsrl/alfred-node/commit/af1e06e154d6249482069e33b546cd97d5785c22))

## [1.1.1](https://github.com/tagshelfsrl/alfred-node/compare/v1.1.0...v1.1.1) (2024-05-01)


### Bug Fixes

* Improved README.md ([#35](https://github.com/tagshelfsrl/alfred-node/issues/35)) ([f9c6e8a](https://github.com/tagshelfsrl/alfred-node/commit/f9c6e8a4d09825e3fde6e0d458484646d8473ef6))

## [1.1.0](https://github.com/tagshelfsrl/alfred-node/compare/v1.0.0...v1.1.0) (2024-04-15)


### Features

* **AL-829:** Support socket connection and events handling ([#31](https://github.com/tagshelfsrl/alfred-node/issues/31)) ([5bcc516](https://github.com/tagshelfsrl/alfred-node/commit/5bcc516062a3f4a04bbc6dd1b9a462e49a4720d5))

## 1.0.0 (2024-04-11)


### Features

* **AL-818:** Implement authorization mechanism and first batch of test suites ([#4](https://github.com/tagshelfsrl/alfred-node/issues/4)) ([c31a927](https://github.com/tagshelfsrl/alfred-node/commit/c31a927a8388a65547def1bab0aa30df1eed61aa))
* **AL-820:** implement deferred session domain with its unit tests. ([#2](https://github.com/tagshelfsrl/alfred-node/issues/2)) ([431fdd5](https://github.com/tagshelfsrl/alfred-node/commit/431fdd555acc0b148c283bd41bc32e8d900c7799))
* **AL-824:** Implement job domain with its unit tests. ([#7](https://github.com/tagshelfsrl/alfred-node/issues/7)) ([d6e8099](https://github.com/tagshelfsrl/alfred-node/commit/d6e8099b82ee31d8f8204b09ffa578ac7cf1ffcb))
* **AL-827:** Setup CI pipeline ([#6](https://github.com/tagshelfsrl/alfred-node/issues/6)) ([74f9bed](https://github.com/tagshelfsrl/alfred-node/commit/74f9bed2c7450a37d0d5c0aa24ba1717f1ea806e))
* implement datapoints domain with its unit tests. ([#5](https://github.com/tagshelfsrl/alfred-node/issues/5)) ([538b0ca](https://github.com/tagshelfsrl/alfred-node/commit/538b0ca84f695354ccf8358b6196d80394e2661e))
* implement files domain. ([#8](https://github.com/tagshelfsrl/alfred-node/issues/8)) ([7b5fdc9](https://github.com/tagshelfsrl/alfred-node/commit/7b5fdc99f6e393992683f19f7c3790a446f63dce))
* trigger release ([#13](https://github.com/tagshelfsrl/alfred-node/issues/13)) ([5ad36cd](https://github.com/tagshelfsrl/alfred-node/commit/5ad36cd23bd5d0a30491fe5227ab3dccdedb0f3f))
* updates gha release step to publish to npm ([#9](https://github.com/tagshelfsrl/alfred-node/issues/9)) ([9503e78](https://github.com/tagshelfsrl/alfred-node/commit/9503e7885f5819e340732e8a8d4ba0690f2971de))


### Bug Fixes

* Added missing release configuration ([c05ca26](https://github.com/tagshelfsrl/alfred-node/commit/c05ca26919bddd99bb16bcb79a30f249f8a2e288))
* gha release-please missing token ([#12](https://github.com/tagshelfsrl/alfred-node/issues/12)) ([1538a09](https://github.com/tagshelfsrl/alfred-node/commit/1538a09e4fd3c6aa269b39aa6c6ba1784c38f195))
* github action adds missing validate branch prefix ([#11](https://github.com/tagshelfsrl/alfred-node/issues/11)) ([814c8b5](https://github.com/tagshelfsrl/alfred-node/commit/814c8b580755cfea732e74b913f9393610833e6a))
* github actions pr create permissions to trigger ([#15](https://github.com/tagshelfsrl/alfred-node/issues/15)) ([4659979](https://github.com/tagshelfsrl/alfred-node/commit/46599791102f71096b14500303e00c0c3ca6f9ae))
* npm publish public ([#24](https://github.com/tagshelfsrl/alfred-node/issues/24)) ([c67b684](https://github.com/tagshelfsrl/alfred-node/commit/c67b6842ba4d54fe501189e3a5df94fe76d39fd0))
* npm publish public scoped ([#28](https://github.com/tagshelfsrl/alfred-node/issues/28)) ([f0f26bd](https://github.com/tagshelfsrl/alfred-node/commit/f0f26bd13e2aab47f3a9d1e0a1a09e4645d58a50))
* Proper exports and package build before publishing ([#30](https://github.com/tagshelfsrl/alfred-node/issues/30)) ([6eb4300](https://github.com/tagshelfsrl/alfred-node/commit/6eb43003802ca9869564672c311b1ac42c9a4eb1))
