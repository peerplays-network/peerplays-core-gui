# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.4](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.5.3-alpha...v1.5.4) (2020-02-12)

### Bug fixes

- withdraw vesting balance, remove balance_type ([99a89ac](https://github.com/peerplays-network/peerplays-core-gui/commit/99a89acda4042bd52e508261ca8666e3c042f023))
- **done.jsx**: participation dialogue not displayed after completing voting ([1a44c77](https://github.com/peerplays-network/peerplays-core-gui/commit/1a44c77eba8ebaa8f84c2d98c99d67ab2ddfcf41))
- **proxy.jsx**: publish button of proxy modal remains disabled ([f89cafd](https://github.com/peerplays-network/peerplays-core-gui/commit/f89cafda9ce6f242a54c1f32d6ac801b798a0be1))
- **vote modal**: published change is not retained on switching tabs ([60052d4](https://github.com/peerplays-network/peerplays-core-gui/commit/60052d4c7175bdd9f923fab7dd7268e591362ba6))
- **helpmodal**: link opening in wrong format ([9516a47](https://github.com/peerplays-network/peerplays-core-gui/commit/9516a47b1a017a180c97d24095aa36a322dd8775))
- **gpos start/participate**: remove completed indicators ([b376d10](https://github.com/peerplays-network/peerplays-core-gui/commit/b376d10a925781a193e575f0ffd2f31324fef6a8))
- **power up/down input**: block entry of 'e', 'E', '-', & '+' (scientific notation support removal) ([39d6bb1](https://github.com/peerplays-network/peerplays-core-gui/commit/39d6bb1c307ba7a4a020a35f4dc7bebe5abcac1a))
- **withdrawal/deposits math**: fix math calculations for withdrawal/deposit on GPOS balances ([1b6615d](https://github.com/peerplays-network/peerplays-core-gui/commit/1b6615db7015339a4c1ddee7e6b09b3554b1df40))
- **finish button in vote section**: "FINISH" button is no longer always clickable ([bf5793c](https://github.com/peerplays-network/peerplays-core-gui/commit/bf5793cfe8148be9bad181aa3c158327a9ab1b4d))
- **claim vesting**: other vesting balance types will no longer appear within the claim balance screen ([604aaa4](https://github.com/peerplays-network/peerplays-core-gui/commit/604aaa4b178955572db244aaeb0c8dba1f81096d))

## [1.5.1-alpha](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.5.0=beta...v1.5.1-alpha) (2019-12-23)

### Bug Fixes

- **power down**: provide first available gpos type vested balance ([8b056bd](https://github.com/peerplays-network/peerplays-core-gui/pull/99/commits/8b056bd9581118067c8b6f593fc76ff02f8865a7))

## [1.5.0-beta](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.28...v1.5.0-beta) (2019-12-17)

### [1.0.28](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.27...v1.0.28) (2019-12-11)


### Bug Fixes

* **power down:** can not withdraw when regular balance is low ([9ba12f7](https://github.com/peerplays-network/peerplays-core-gui/commit/9ba12f73c4f984db7f11a83ac092babe79c15c0d))

### [1.0.27](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.26...v1.0.27) (2019-12-11)


### Bug Fixes

* **power down:** can not withdraw when regular balance is low ([94dc174](https://github.com/peerplays-network/peerplays-core-gui/commit/94dc1741f0846e0f1beffbe9771e8955d0fa1f3e))

### [1.0.26](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.25...v1.0.26) (2019-12-11)


### Bug Fixes

* fixed a merge conflict issue with deprecated variable naming ([fee2ae5](https://github.com/peerplays-network/peerplays-core-gui/commit/fee2ae57ff6645dba91e3f3f7593b1d79c9ebf5b))

### [1.0.25](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.24...v1.0.25) (2019-12-11)

### [1.0.24](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.23...v1.0.24) (2019-12-10)


### Bug Fixes

* **power down:** resolve issue causeing power down to fail ([5659447](https://github.com/peerplays-network/peerplays-core-gui/commit/5659447345f7b442a7322ba88bd0e51389df0b7a))

### [1.0.23](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.22...v1.0.23) (2019-12-10)


### Bug Fixes

* fix invalid check for submit ([8bc3cbc](https://github.com/peerplays-network/peerplays-core-gui/commit/8bc3cbc451b0727e6dc9f3ee8c4f9ac6bcc6518c))

### [1.0.22](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.21...v1.0.22) (2019-12-10)

### Bug Fixes

* **votingactions.js:** fix undeclared var error ([f138cd3](https://github.com/peerplays-network/peerplays-core-gui/commit/f138cd343796aa9543f51bfbe4ca848aee237180))
* **walletservice:** double variable declaration fix reported by S.C ([2d1a7f9](https://github.com/peerplays-network/peerplays-core-gui/commit/2d1a7f9b7c584b741b8e38494fc200b0986a1da0))

* WAL-291 (#82) ([dd7da7b](https://github.com/peerplays-network/peerplays-core-gui/commit/dd7da7b79cbd023efe1e27bc6191ca0ff88cf6af)), closes [#82](https://github.com/peerplays-network/peerplays-core-gui/issues/82) [#79](https://github.com/peerplays-network/peerplays-core-gui/issues/79)
* Pbsa develop (#62) ([64fd27a](https://github.com/peerplays-network/peerplays-core-gui/commit/64fd27a4a4255dd6aac4042eec34ee05213d29fd)), closes [#62](https://github.com/peerplays-network/peerplays-core-gui/issues/62) [#58](https://github.com/peerplays-network/peerplays-core-gui/issues/58) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#54](https://github.com/peerplays-network/peerplays-core-gui/issues/54) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#53](https://github.com/peerplays-network/peerplays-core-gui/issues/53) [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#61](https://github.com/peerplays-network/peerplays-core-gui/issues/61) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#54](https://github.com/peerplays-network/peerplays-core-gui/issues/54) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#53](https://github.com/peerplays-network/peerplays-core-gui/issues/53) [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36)
* Master -> pbsa-develop (#58) (#59) ([5f2a101](https://github.com/peerplays-network/peerplays-core-gui/commit/5f2a1015ca7ccf1beebc0b4fbc45e4f01d417e29)), closes [#58](https://github.com/peerplays-network/peerplays-core-gui/issues/58) [#59](https://github.com/peerplays-network/peerplays-core-gui/issues/59) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#54](https://github.com/peerplays-network/peerplays-core-gui/issues/54) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#53](https://github.com/peerplays-network/peerplays-core-gui/issues/53) [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36)
* Pbsa develop (#55) ([337bfef](https://github.com/peerplays-network/peerplays-core-gui/commit/337bfef4c84238a3f7e880c30c0ae20e59f2f707)), closes [#55](https://github.com/peerplays-network/peerplays-core-gui/issues/55) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#53](https://github.com/peerplays-network/peerplays-core-gui/issues/53) [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)
* (hotfix) - WAL-243 (#54) ([3304d2a](https://github.com/peerplays-network/peerplays-core-gui/commit/3304d2ae5b7a9453490d996b5daccffa8d474a08)), closes [#54](https://github.com/peerplays-network/peerplays-core-gui/issues/54) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#53](https://github.com/peerplays-network/peerplays-core-gui/issues/53) [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)
* Master (#56) ([d72b1cb](https://github.com/peerplays-network/peerplays-core-gui/commit/d72b1cbf0eae186cbf391718d67fe768aa1dd9a0)), closes [#56](https://github.com/peerplays-network/peerplays-core-gui/issues/56) [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50) [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)
* Pbsa develop -> develop (#52) ([d9d7df9](https://github.com/peerplays-network/peerplays-core-gui/commit/d9d7df9274ceb00931e608955b670af5633c8255)), closes [#52](https://github.com/peerplays-network/peerplays-core-gui/issues/52) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)
* Pbsa develop (#51) ([7e20eff](https://github.com/peerplays-network/peerplays-core-gui/commit/7e20eff71c62046efecdec811dd9e938a4ae4938)), closes [#51](https://github.com/peerplays-network/peerplays-core-gui/issues/51) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)
* Pbsa develop (#48) ([26cb628](https://github.com/peerplays-network/peerplays-core-gui/commit/26cb628c2edc5cefcaaa827eede4d67d3ad71191)), closes [#48](https://github.com/peerplays-network/peerplays-core-gui/issues/48) [#35](https://github.com/peerplays-network/peerplays-core-gui/issues/35) [#30](https://github.com/peerplays-network/peerplays-core-gui/issues/30) [#36](https://github.com/peerplays-network/peerplays-core-gui/issues/36) [#38](https://github.com/peerplays-network/peerplays-core-gui/issues/38) [#39](https://github.com/peerplays-network/peerplays-core-gui/issues/39) [#44](https://github.com/peerplays-network/peerplays-core-gui/issues/44) [#49](https://github.com/peerplays-network/peerplays-core-gui/issues/49) [#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40) [#43](https://github.com/peerplays-network/peerplays-core-gui/issues/43) [#46](https://github.com/peerplays-network/peerplays-core-gui/issues/46) [#50](https://github.com/peerplays-network/peerplays-core-gui/issues/50)

### ⚠ BREAKING CHANGES

* **ws:** removal of peerplaysjs-ws and refactoring of its imports

### Bug Fixes

* fix distributable crashing ([bb07077](https://github.com/peerplays-network/peerplays-core-gui/commit/bb0707704a3fed78f1e6f854a1c52ceeda9eb6e2))


* **ws:** removed peerplaysjs-ws ([89aa3f3](https://github.com/peerplays-network/peerplays-core-gui/commit/89aa3f35a7c5d9edb6f6da7937ce7b03effc9846))


### [1.0.21](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.20...v1.0.21) (2019-12-10)

WAL-250

* fix(tgpos transaction): correct parameter name

name for parameter was incorrect within gpos transaction operation object.

WAL-250

* feat: display gpos stats regardless of user gpos balance

add config for quick swap config of this functionality

WAL-275

* feat: remove vote header nav button

functionality has been moved to the gpos modal

WAL-274

* feat(vote tab): added vote tab functionality to gpos modal

voting functionality exists inside the modal. still pending other gui elements on this section

WAL-251

* style(gpos vote): style modifications

* style(gpos voting): styles

* feat(vote tab): navigation buttons and styling

modified styles to match mockup and added navigation

* feat(locales): update all locale files

* style: done screen temp wip styles

* feat(done): complete done page

WAL-252

* style(gpos modal): gpos modal styles and fonts

* style: gpos font constants

also fixed bug with spacing below gpos panel button when conditional stat display is disabled

* chore(package security): update a few packages to resolve npm audit flag

* chore: resolve TODO

* chore: remove debugger

can't reach this debugger but bad practice to have it there in general

* feat: alterations to gpos panel

statistics now display a percentage of total rake reward

WAL-277

* docs: version bump

* feat: alterations to gpos panel

statistics now display a percentage of total rake reward

WAL-277

* docs: version bump + changelog

* feat: alterations to gpos panel

statistics now display a percentage of total rake reward

WAL-277

* docs: version bump + changelog

* style: increase size of gpos panel button

* docs: version bump + changelog

* fix(pr changes): made changes as a result of PR comments

* style: vote page styling on smaller screens

more repsonsive support

* chore: version bump + changelog

* refactor: alter capitalization of gpos panel stats

* docs: version bump + changelog

* fix(step1): fix NaN amount when input is empty

* docs: version bump + changelog

* fix: bedmas

* style: style changes due to recent spec changes

* feat: alterations to gpos panel

statistics now display a percentage of total rake reward

WAL-277

* docs: version bump + changelog

* feat(gpos start): updated the gpos start page

made changes according to recent GUI spec changes

WAL-249

* docs(gpos start): changes to gpos start screen

WAL-249

* feat: start screen images changed

* style: style changes due to recent spec changes

* style: reskin gpos modal power up screen

tweaked number mechanics a bit in this screen

WAL-250

* feat: number input max character limit added

cannot enter number that exceeds 32 digits on power up/down screen

* style: power up/down screen more responsive friendly & img update

power up image on start screen was wrong

* feat(power down route): added power down screen access

screen is still disabled due to button access but the routing to render the power down and its
contents are there now

* feat(power down): power down screen now renders properly

minimized some code that renders the power up/down

WAL-250

* feat: dynamic completed tags on stages

start screen will now dynamically track if a stage(power up, power down, and/or vote) has been
completed
* actual submission to the blockchain for a power up and power down has been disabled
until they are fully implemented.

WAL-250

* feat: dynamic disable of vote "button"

* feat: dynamic button text on start screen of gpos

if there is any progress, the button will say DONE else it says CANCEL

* feat: vote disabled based on conditions

gpos balance must be greater than zero and the user must have completed one of the two enabled
actions.

WAL-250

* fix: bug with enable/disable of submit button resolved

* feat(transaction): auto-signing and error/success

sign power up/down transactions automatically and display custom success/error screens for the
result of the transaction broadcast

WAL-250

* refactor: remove deprecated code

* feat: get fees into power up/down state

* feat: error states, custom transaction signing,styling

modified styles a bit to be more friendly for error state disaply

WAL-250

* chore(version): version bump + changelog

* fix: succeed skipping input stage

added a configurable fake success toggle for power down action.resolved issue where the input form
was being skipped during a fake success power up/down action

WAL-250

* docs: version bump + changelog

* chore: merge conflict resolutions

* docs: version bump + changelog

qa release

WAL-279, WAL-249, WAL-250, WAL-277, PJL-23

* fix: number picker color

wrong color was being used in electron builds

* fix: capitlization error on GPOS Panel

* fix: live update of gpos data

gpos data in the gpos panel was not updating live, no longer require re-logging into a user account
to get fresh data

WAL-277

* fix: change balance type to string

* fix(gpos modal): state cleanup on logout

reset all gpos modal data on logout as it was persisting across different logins prior. Involved
moving some data to global redux as the modal never unmounts on a logout

WAL-249

* refactor: remove commented out code

* refactor: refactor wizard and step1 to modal and DepositWithdraw

impact is on nearly all files related to GPOS

WAL-276

* WAL-279, WAL-249, WAL-250, WAL-277, WAL-292, WAL-293, WAL-281, PJL-23 (#81) ([ac2853a](https://github.com/peerplays-network/peerplays-core-gui/commit/ac2853a)), closes [#81](https://github.com/peerplays-network/peerplays-core-gui/issues/81) [#79](https://github.com/peerplays-network/peerplays-core-gui/issues/79)


### Bug Fixes

* **power down:** changed some logic related to "errors" ([ab8447f](https://github.com/peerplays-network/peerplays-core-gui/commit/ab8447f))
* **power down:** spelling/grammar fix ([949fb02](https://github.com/peerplays-network/peerplays-core-gui/commit/949fb02))


### Features

* **power up/down description:** added the text for power up/down desc ([c637c36](https://github.com/peerplays-network/peerplays-core-gui/commit/c637c36))

### [1.0.20](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.19...v1.0.20) (2019-12-06)

### [1.0.19](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.18...v1.0.19) (2019-12-06)


### Bug Fixes

* **gpos modal:** state cleanup on logout ([5e65bfa](https://github.com/peerplays-network/peerplays-core-gui/commit/5e65bfa))
* **package.json:** re-add windows to dist script ([190e8eb](https://github.com/peerplays-network/peerplays-core-gui/commit/190e8eb))
* **power down:** incorrect max min check on power down action resolved ([9d5fbc3](https://github.com/peerplays-network/peerplays-core-gui/commit/9d5fbc3))
* **powerdown:** correct the withdrawal date check ([12395bd](https://github.com/peerplays-network/peerplays-core-gui/commit/12395bd))
* capitlization error on GPOS Panel ([5ecf477](https://github.com/peerplays-network/peerplays-core-gui/commit/5ecf477))
* change balance type to string ([63837fc](https://github.com/peerplays-network/peerplays-core-gui/commit/63837fc))
* live update of gpos data ([6f7bd1d](https://github.com/peerplays-network/peerplays-core-gui/commit/6f7bd1d))


### Features

* **power down:** change max amount allowed withing power down ([5b54d2c](https://github.com/peerplays-network/peerplays-core-gui/commit/5b54d2c))
* **power down:** implement single transaction withdrawal ([6046541](https://github.com/peerplays-network/peerplays-core-gui/commit/6046541))
* modification due to chain changes ([d5118e4](https://github.com/peerplays-network/peerplays-core-gui/commit/d5118e4))
* **gpos panel:** change "lowest reward" to "lower reward" ([e824808](https://github.com/peerplays-network/peerplays-core-gui/commit/e824808))
* **gpos panel:** implement strings for voting performance ([197712b](https://github.com/peerplays-network/peerplays-core-gui/commit/197712b))
* **last_vote_time:** add param to all vote actions for account_update ([579794f](https://github.com/peerplays-network/peerplays-core-gui/commit/579794f))
* **power down:** modify such that available gpos is shown ([1356fbe](https://github.com/peerplays-network/peerplays-core-gui/commit/1356fbe))
* **power down:** support for when no available gpos balances ([31aa596](https://github.com/peerplays-network/peerplays-core-gui/commit/31aa596))
* **power up/down:** check if a v.balance can be withdrawn ([5208562](https://github.com/peerplays-network/peerplays-core-gui/commit/5208562))
* **power up/down:** power up down transactions now succeed ([13bf661](https://github.com/peerplays-network/peerplays-core-gui/commit/13bf661))
* **recent activity:** add support for vesting_balance_create ([a672bc7](https://github.com/peerplays-network/peerplays-core-gui/commit/a672bc7))

<a name="1.0.17"></a>
## [1.0.17](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.16...v1.0.17) (2019-10-08)

### Fixed

- incorrect default color on number picker buttons on gpos power up/down screens in electron builds

<a name="1.0.17"></a>
## [1.0.17](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.16...v1.0.17) (2019-10-08)

### QA Release

- configured to fake a successful power down in lieu of transaction validation issues for frontend gpos related actions
- WAL-279
  - UI/UX related items for Power Up/Down transaction broadcast results
  - configured to "fake" a success response for Power Down action
- WAL-249
  - new design for the getting started screen
- WAL-250
  - new design for the power up/down screens
  - pairs with WAL-279 for in lieu of transaction validation issues on chain
- WAL-277
  - new GPOS panel design
- PJL-23
  - security issues in the peerplaysjs-lib addressed as well as some serialization tweaks required for GPOS on chain
  - un-published release of the peerplaysjs-lib in use until testing passes

<a name="1.0.16"></a>
## [1.0.16](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.15...v1.0.16) (2019-10-08)

### Added

- configurable fake succeed on power down action

### Fixed

- issue with succeed screen skipping the form input stage

<a name="1.0.15"></a>
## [1.0.15](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.14...v1.0.15) (2019-10-08)

### Added

- Dynamic transaction signing for GPOS Modal Power Up/Down
  - added custom error/success screens for this

### Changed

- Dynamic form validation for Power Up/Down
- Some style tweaks

<a name="1.0.14"></a>
## [1.0.14](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.13...v1.0.14) (2019-09-26)

### Changed

- Updates to GUI for GPOS start page.

<a name="1.0.13"></a>
## [1.0.13](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.12...v1.0.13) (2019-09-26)

### Changed

- Capitalization of working in the GPOS panel balance specification section.

<a name="1.0.12"></a>
## [1.0.12](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.11...v1.0.12) (2019-09-25)

### Changed

- Increase the size of the GPOS panel participate/get started button.

<a name="1.0.11"></a>
## [1.0.11](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.10...v1.0.11) (2019-09-25)

### Changed

- Made the GPOS Panel statistics easier to understand (WAL-277).
<a name="1.0.10.d"></a>
## [1.0.10.d](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.10.c...v1.0.10d) (2019-09-26)

### Bug Fixes

- babel-polyfill issue causing application to hang when in production mode

<a name="1.0.10.c"></a>
## [1.0.10.c](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.10.b...v1.0.10c) (2019-09-26)

### Bug Fixes

- No longer display NaN when power up/down input is empty

<a name="1.0.10.b"></a>
## [1.0.10.b](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.10...v1.0.10b) (2019-09-26)

### Added

- Responsiveness support added to the Done screen

### Bug Fixes

- Power Up number input now allows empty values

<a name="1.0.10"></a>
## [1.0.10](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.9...v1.0.10) (2019-09-25)

### Added

- Done screen to the GPOS Modal (WAL-252)

### Changed

- Vote functionality has been moved to the GPOS moda (WAL-251, WAL-274)
- GPOS Panel balance statistics conditionally displays based on configuration value setting. Default is to always show the balance statistics (WAL-275).

<a name="1.0.9"></a>
## [1.0.9](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.6...v1.0.9) (2019-09-13)

### Added

- remote mainnet api endpoints connectivity method (WAL-271)
- GPOS Wizard start screen (WAL-249)

<a name="1.0.6"></a>
## [1.0.6](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.1...v1.0.6) (2019-09-03)

### Changed

- remove GPOS Vested Balance types from "Vesting Balances (Witness Pay)" section (WAL-246)
- change text of "Vesting Balances (Witness Pay)" to "Pending Balances" (WAL-255)

### Added

- GPOS Panel (WAL-247)
- help modal dummy extended FAQ content (WAL-253)
- display project code version in top middle of application (WAL-256)

### BREAKING CHANGES

Upgraded webpack from version 1 to version 4.

- re-write of scripts that compile the codebase

<a name="1.0.1"></a>
## [1.0.1](https://github.com/peerplays-network/peerplays-core-gui/compare/v1.0.0...v1.0.1) (2019-06-04)


### Bug Fixes

* **idb:** fix retrieval of items from idb cursor ([#40](https://github.com/peerplays-network/peerplays-core-gui/issues/40)) ([1d85d0c](https://github.com/peerplays-network/peerplays-core-gui/commit/1d85d0c))
* better support for legacy accounts ([1410586](https://github.com/peerplays-network/peerplays-core-gui/commit/1410586))

# [1.0.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.1...v1.0.0) (2019-05-07)

### ⚠ BREAKING CHANGES

* new library code in use and required for this branches new latency conenctivity
code

### build

* peerplaysjs dependencies update ([caf68c9](https://github.com/peerplays-network/peerplays-core-gui/commit/caf68c9e675f68b74f504a4fedcfe280b38e5729))

<a name="0.5.2"></a>
## [0.5.2](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.1...v0.5.2) (2019-05-09)


### Bug Fixes

* fix distributable crashing ([bb07077](https://github.com/peerplays-network/peerplays-core-gui/commit/bb07077))


### Code Refactoring

* **ws:** removed peerplaysjs-ws ([89aa3f3](https://github.com/peerplays-network/peerplays-core-gui/commit/89aa3f3))


### BREAKING CHANGES

* **ws:** removal of peerplaysjs-ws and refactoring of its imports

## [0.5.1](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.0...v0.5.1) (2019-04-10)

### build

* peerplaysjs dependencies update ([caf68c9](https://github.com/peerplays-network/peerplays-core-gui/commit/caf68c9))

### BREAKING CHANGES

* new library code in use and required for this branches new latency conenctivity
code

<a name="0.5.0"></a>
# [0.5.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.4.3...v0.5.0) (2019-04-09)

### ⚠ BREAKING CHANGES

* build process has changed. building executables not working yet
* electron upgrade and many file/script modifications

### Bug Fixes

* fixed merge conflicts ([cc63ce3](https://github.com/peerplays-network/peerplays-core-gui/commit/cc63ce3))


### build

* move electron build in-repo ([61d2119](https://github.com/peerplays-network/peerplays-core-gui/commit/61d2119))


### Chores

* merge WAL-134 ([3cef1f6](https://github.com/peerplays-network/peerplays-core-gui/commit/3cef1f6))


### BREAKING CHANGES

* build process has changed. building executables not working yet
* electron upgrade and many file/script modifications

### [0.4.3](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.4.0...v0.4.3) (2019-04-05)

## [0.4.2-rc.1] - 03-28-19

### Changed

- Removed common option row from proposal confirmation modals.
- Resolved issues with vote tab hanging on load.
- Cleaned up some residue files in the repository.
- Login form allows full stops and dashes to ensure older bitshares generated accounts can login.

## [0.4.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.3.2...v0.4.0) (2019-02-15)

### Changed

- The fees list now shows fee amounts correctly (some were “-*”).
- Better error handling and error display when confirming a transaction.
- Prior users transaction history will no longer be displayed briefly to the different, newly logged in user.
- The header of the help modal will now be fixed to the top when scrolling the help modal content.
- The help modal now scrolls properly to allow visibility of entire help section.
- Update to the “How to claim PPY Tokens” link within the help modal.
- Sub-section links within the Help modal have been fixed.
- More logical error when signing up for accounts to indicate the requirements of an account name.
- Account name input fields no longer accept uppercase letters. Instead, they will be converted to lowercase on-the-fly.
- The Play tab has been removed.
- The codebase directory has been restructured better.
- The codebase has had thorough formatting made to improve code readability/maintainability for developers.

### Added

- Witnesses list now displays all registered witnesses, not just the active ones.
- Multiple Node Endpoint Support added.
- Common Message Module has been implemented.

### [0.3.2](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.3.1...v0.3.2) (2019-01-28)

### [0.3.1](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.3.0...v0.3.1) (2019-01-28)

## [0.3.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.2.0...v0.3.0) (2019-01-25)

## [0.2.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.1.7...v0.2.0) (2019-01-07)

### 0.1.7 (2018-10-02)

### 0.1.6 (2018-08-27)

### 0.1.5 (2018-08-08)

### 0.1.4 (2018-07-24)

### 0.1.3 (2018-04-19)
