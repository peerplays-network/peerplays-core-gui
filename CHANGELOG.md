# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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


<a name="1.0.0"></a>
# [1.0.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.1...v1.0.0) (2019-05-07)

<a name="0.5.2"></a>
## [0.5.2](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.1...v0.5.2) (2019-05-09)


### Bug Fixes

* fix distributable crashing ([bb07077](https://github.com/peerplays-network/peerplays-core-gui/commit/bb07077))


### Code Refactoring

* **ws:** removed peerplaysjs-ws ([89aa3f3](https://github.com/peerplays-network/peerplays-core-gui/commit/89aa3f3))


### BREAKING CHANGES

* **ws:** removal of peerplaysjs-ws and refactoring of its imports



<a name="0.5.1"></a>
## [0.5.1](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.5.0...v0.5.1) (2019-04-10)


### build

* peerplaysjs dependencies update ([caf68c9](https://github.com/peerplays-network/peerplays-core-gui/commit/caf68c9))


### BREAKING CHANGES

* new library code in use and required for this branches new latency conenctivity
code



<a name="0.5.0"></a>
# [0.5.0](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.4.3...v0.5.0) (2019-04-09)


### Bug Fixes

* fixed merge conflicts ([cc63ce3](https://github.com/peerplays-network/peerplays-core-gui/commit/cc63ce3))


### build

* move electron build in-repo ([61d2119](https://github.com/peerplays-network/peerplays-core-gui/commit/61d2119))


### Chores

* merge WAL-134 ([3cef1f6](https://github.com/peerplays-network/peerplays-core-gui/commit/3cef1f6))


### BREAKING CHANGES

* build process has changed. building executables not working yet
* electron upgrade and many file/script modifications


<a name="0.4.3"></a>
## [0.4.3](https://github.com/peerplays-network/peerplays-core-gui/compare/v0.4.0...v0.4.3) (2019-04-05)

## [0.4.2-rc.1] - 03-28-19

### Changed

- Removed common option row from proposal confirmation modals.
- Resolved issues with vote tab hanging on load.
- Cleaned up some residue files in the repository.
- Login form allows full stops and dashes to ensure older bitshares generated accounts can login.

## [0.4.0] - 02-15-19

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
