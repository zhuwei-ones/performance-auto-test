# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0-alpha.24](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.23...v1.1.0-alpha.24) (2023-07-18)


### Bug Fixes

* 输出报告的lighthouse 详情报告链接顺序错误 ([5585385](https://github.com/zhuwei-ones/performance-auto-test/commit/55853857c6024e0abf8fea164ee7462afd46473b))

## [1.1.0-alpha.23](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.22...v1.1.0-alpha.23) (2023-07-18)


### Features

* lighthouse 如果某次报告不通过，就保存输出的json 数据，用于Performance分析 ([fc5a5ee](https://github.com/zhuwei-ones/performance-auto-test/commit/fc5a5ee09e5aea4583456c22fcbd530702acb2ee))

## [1.1.0-alpha.22](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.21...v1.1.0-alpha.22) (2023-07-15)


### Features

* 支持把lighthouse 报告转成图片 ([79856ee](https://github.com/zhuwei-ones/performance-auto-test/commit/79856eeab77021f581f041fb231a9a65ab5162c3))

## [1.1.0-alpha.21](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.20...v1.1.0-alpha.21) (2023-07-15)


### Bug Fixes

* 报告的折线图根据传入的指标类型来确定，不固定为 LCP、CLS、FID ([7bb7921](https://github.com/zhuwei-ones/performance-auto-test/commit/7bb792168dcdf69a7aeb52e484157dbe9a4ffe05))

## [1.1.0-alpha.20](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.19...v1.1.0-alpha.20) (2023-07-14)


### Features

* 支持输出报告为图片，方便查看 ([b501687](https://github.com/zhuwei-ones/performance-auto-test/commit/b501687a7baf6aceeb27eb8c4bb394af58a52dbc))

## [1.1.0-alpha.19](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.18...v1.1.0-alpha.19) (2023-07-11)


### Bug Fixes

* 报告显示kb 或者 mb ([f814832](https://github.com/zhuwei-ones/performance-auto-test/commit/f81483280cc98c100d65b6b27861183c6821178a))

## [1.1.0-alpha.18](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.17...v1.1.0-alpha.18) (2023-07-11)


### Bug Fixes

* lighthouse 自己配置应该比全局的配置高 ([5dd3c0e](https://github.com/zhuwei-ones/performance-auto-test/commit/5dd3c0e1c96d22050a30dc77ebab9eebe43fd3a7))

## [1.1.0-alpha.17](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.16...v1.1.0-alpha.17) (2023-07-11)

## [1.1.0-alpha.16](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.15...v1.1.0-alpha.16) (2023-07-10)


### Bug Fixes

* 网速设置显示错误 ([ddce453](https://github.com/zhuwei-ones/performance-auto-test/commit/ddce453d3fc2802a736267934235af1b98d0a655))

## [1.1.0-alpha.15](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.14...v1.1.0-alpha.15) (2023-07-07)


### Bug Fixes

* 报告路径错误 ([8cd03b8](https://github.com/zhuwei-ones/performance-auto-test/commit/8cd03b8d00800e8d41cd0b6074ff1cf83681edea))

## [1.1.0-alpha.14](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.13...v1.1.0-alpha.14) (2023-07-07)


### Bug Fixes

* 显示时间格式化 ([affd10f](https://github.com/zhuwei-ones/performance-auto-test/commit/affd10fa6717e012a008035fac45ab8008f1fd61))
* json 根据配置来生成 ([f21df23](https://github.com/zhuwei-ones/performance-auto-test/commit/f21df23625497c257b128382dd50b6ce630a24c2))

## [1.1.0-alpha.13](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.12...v1.1.0-alpha.13) (2023-07-07)


### Features

* 支持输出全部json 用于performance 观察 ([a38fcb1](https://github.com/zhuwei-ones/performance-auto-test/commit/a38fcb1c124c3f9af069e17bb522ea8e98f6abd3))

## [1.1.0-alpha.12](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.11...v1.1.0-alpha.12) (2023-07-06)


### Features

* 支持保存 trace json ([a3917b3](https://github.com/zhuwei-ones/performance-auto-test/commit/a3917b351d1d5fe8adfd105ca64c48114c74ccd7))

## [1.1.0-alpha.11](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.10...v1.1.0-alpha.11) (2023-07-05)


### Features

* 支持传入指标比较的类型，avg | p75 | p90 ([47fac3e](https://github.com/zhuwei-ones/performance-auto-test/commit/47fac3ee172a583b58bf0aaf203fe68234b6d13b))

## [1.1.0-alpha.10](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.9...v1.1.0-alpha.10) (2023-06-30)


### Features

* 性能报告支持输出md格式 ([5f9d521](https://github.com/zhuwei-ones/performance-auto-test/commit/5f9d521ef0836363e35978d85295d2facbc78d98))

## [1.1.0-alpha.9](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.8...v1.1.0-alpha.9) (2023-06-25)

## [1.1.0-alpha.8](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.6...v1.1.0-alpha.8) (2023-06-12)


### Bug Fixes

* 程序运行无法退出，强制退！ ([02fd317](https://github.com/zhuwei-ones/performance-auto-test/commit/02fd31777089ff269d805bb4d9835baa902a6bd5))

## [1.1.0-alpha.7](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.6...v1.1.0-alpha.7) (2023-06-12)


### Bug Fixes

* 程序运行无法退出，强制退！ ([02fd317](https://github.com/zhuwei-ones/performance-auto-test/commit/02fd31777089ff269d805bb4d9835baa902a6bd5))

## [1.1.0-alpha.6](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.5...v1.1.0-alpha.6) (2023-06-09)

## [1.1.0-alpha.5](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.4...v1.1.0-alpha.5) (2023-06-09)


### Features

* 支持报告添加测试波动折线图 ([5ce2d44](https://github.com/zhuwei-ones/performance-auto-test/commit/5ce2d4420aab737d4f5c3f2d9d7fd19cc7c70e84))

## [1.1.0-alpha.4](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.3...v1.1.0-alpha.4) (2023-06-08)


### Features

* 报告支持输出 P75 和 P90 ([0d5f567](https://github.com/zhuwei-ones/performance-auto-test/commit/0d5f5672bbaac5d1ba1acc67d37f041254c6cbce))

## [1.1.0-alpha.3](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.2...v1.1.0-alpha.3) (2023-06-07)


### Bug Fixes

* 没有开发 sitespeed 和 lighthouse 参数 ([0053be9](https://github.com/zhuwei-ones/performance-auto-test/commit/0053be92be44af65cc4d7ae458e0bb48c63d11a9))

## [1.1.0-alpha.2](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.1...v1.1.0-alpha.2) (2023-04-27)


### Bug Fixes

* 参数未开放传入 ([cdb7c90](https://github.com/zhuwei-ones/performance-auto-test/commit/cdb7c903316b6b81ed50265274c0f7815b56824a))

## [1.1.0-alpha.1](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.1.0-alpha.0...v1.1.0-alpha.1) (2023-04-27)

## [1.1.0-alpha.0](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.0.1...v1.1.0-alpha.0) (2023-04-24)


### Features

* 支持是否预览选项 ([db6c3ba](https://github.com/zhuwei-ones/performance-auto-test/commit/db6c3ba5d39a7a5843b026cd2cd91873aa63c7d9))
* lighthouse 支持传入 options，用于定义 chrome ([f9d0c7f](https://github.com/zhuwei-ones/performance-auto-test/commit/f9d0c7fe42214eaa04698ad498ea2501c179da4b))


### Bug Fixes

* 名字错误 ([50a6794](https://github.com/zhuwei-ones/performance-auto-test/commit/50a6794f05a74b621e2acad836d0a2784219fa36))
* 默认值判断错误 ([dcc329b](https://github.com/zhuwei-ones/performance-auto-test/commit/dcc329bf942df87a290edc6bdd5ae759d334e808))

### [1.0.1](https://github.com/zhuwei-ones/performance-auto-test/compare/v1.0.0...v1.0.1) (2023-04-19)


### Bug Fixes

* 处理空值 ([d0e780b](https://github.com/zhuwei-ones/performance-auto-test/commit/d0e780b62cd360c45a5b785105d5bda23e616824))

## 1.0.0 (2023-04-18)


### Features

* 支持使用sitespeed 和 lighthouse 跑性能测试，并且输出性能比较报告 ([292e732](https://github.com/zhuwei-ones/performance-auto-test/commit/292e7326b70a2f986aac91f75fba64a333ce7293))
* 支持指标颜色打印+最终报告输出总的测试是否通过结论 ([46da6de](https://github.com/zhuwei-ones/performance-auto-test/commit/46da6dedd9906ede632c248a49cfb2beba851c68))
* lighthouse 支持保存原性能测试json到文件中 ([0f8c7c8](https://github.com/zhuwei-ones/performance-auto-test/commit/0f8c7c8b7a7387bc8bfcbb2d8d20f9240fdcace6))


### Bug Fixes

* lighthouse rttms 未同步 ([22a002d](https://github.com/zhuwei-ones/performance-auto-test/commit/22a002d0d32be12c4b0daed4bc617d9827cf2363))
