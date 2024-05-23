# Changelog

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
