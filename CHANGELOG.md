# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
