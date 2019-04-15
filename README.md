# PeerplaysJS (peerplaysjs-lib)

Pure JavaScript Bitshares/Graphene library for node.js and browsers. Can be used to construct, sign and broadcast transactions in JavaScript, and to easily obtain data from the blockchain via public apis.

Most of this code was written by [jcalfee](https://github.com/jcalfee).

[![npm version](https://img.shields.io/npm/v/peerplaysjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/peerplaysjs-lib)
[![npm version](https://img.shields.io/node/v/peerplaysjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/peerplaysjs-lib)
[![npm downloads](https://img.shields.io/npm/dm/peerplaysjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/peerplaysjs-lib)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## Setup

This library can be obtained through npm:

```bash
npm install peerplaysjs-lib
```

## Getting Started

It is recommended to use Node v8.9.x.

On Ubuntu and OSX, the easiest way to install Node is to use the [Node Version Manager](https://github.com/creationix/nvm).
For Windows users there is [NVM-Windows](https://github.com/coreybutler/nvm-windows).

To install NVM for Linux/OSX, simply copy paste the following in a terminal:

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
nvm install v8
nvm use v8
```

Once you have Node installed, you can clone the repo:

```bash
git clone https://github.com/peerplays-network/peerplaysjs-lib
cd peerplaysjs-lib
```

## Development

Initialize the application by running `npm run init`. Doing so will install commitizen globally on your environment so you can later commit via `git cz`.

### Commits

> If you have run the init script, you can commit via `git cz`.  
> If you have not run the init script, you must commit via `npm run commit`.  
> If you do neither, commit message consistency will be difficult for you.

This repository uses a combination of tools to aid in consistent commit messages. The reason we do this is so we can have dynamic changelog creation and smart semantic versioning based on commits (with the ability to override).
The following tools are used:

1. [commitizen](https://www.npmjs.com/package/commitizen)  
   Used for prompting recommended entries within a commit message to ensure it contains the necessary information.
   - [conventional changelog](https://www.npmjs.com/package/cz-conventional-changelog)  
     - Prompts for conventional changelog standard.
2. [husky](https://www.npmjs.com/package/husky)  
   By using the hooks from this package we intercept commits being made and verify them with commitlint.
   - Prevent bad commits/pushes.
3. [commitlint](https://www.npmjs.com/package/@commitlint/cli)
   - cli
   - [config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional)
     - rule preset in use

## Usage

Four sub-libraries are included: `ECC`, `Chain`, `WS` and `Serializer`. Generally only the `ECC` and `Chain` libraries need to be used directly. The `WS` library handles all the websocket connections.

### WS

<details>

<summary>peerplaysjs-ws is deprecated</summary>

Peerplaysjs-lib includes the now deprecated peerplaysjs-ws library within itself. Updating your code to reflect this is simple, here is an example:

```javascript
// current code
import {Apis} from 'peerplaysjs-ws';

// refactored
import {Apis} from 'peerplaysjs-lib';
```

Once you have all of your peerplaysjs-ws imports updated, you can uninstall the peerplaysjs-ws package.
</details>


```html
<script type="text/javascript" src="https://cdn.rawgit.com/pbsa/peerplaysjs-ws/build/peerplaysjs-ws.js" />
```

A variable peerplays_ws will be available in window.

For use in a webpack/browserify context, see the example below for how to open a websocket connection to the Openledger API and subscribe to any object updates:

```javascript
var {Apis} = require("peerplaysjs-lib");
Apis.instance("wss://bitshares.openledger.info/ws").init_promise.then((res) => {
    console.log("connected to:", res[0].network);
    Apis.instance().db_api().exec( "set_subscribe_callback", [ updateListener, true ] )
});

function updateListener(object) {
    console.log("set_subscribe_callback:\n", object);
}
```

The `set_subscribe_callback` callback (updateListener) will be called whenever an object on the blockchain changes or is removed. This is very powerful and can be used to listen to updates for specific accounts, assets or most anything else, as all state changes happen through object updates. Be aware though that you will receive quite a lot of data this way.

### Chain

This library provides utility functions to handle blockchain state as well as a login class that can be used for simple login functionality using a specific key seed.

#### Login

The login class uses the following format for keys:

```bash
keySeed = accountName + role + password
```

Using this seed, private keys are generated for either the default roles `active, owner, memo`, or as specified. A minimum password length of 12 characters is enforced, but an even longer password is recommended. Three methods are provided:

```js
generateKeys(account, password, [roles])
checkKeys(account, password, auths)
signTransaction(tr)
```

The auths object should contain the auth arrays from the account object. An example is this:

```json
{
    active: [
        ["GPH5Abm5dCdy3hJ1C5ckXkqUH2Me7dXqi9Y7yjn9ACaiSJ9h8r8mL", 1]
    ]
}
```

If checkKeys is successful, you can use signTransaction to sign a TransactionBuilder transaction using the private keys for that account.

#### State container

The Chain library contains a complete state container called the ChainStore. The ChainStore will automatically configure the `set_subscribe_callback` and handle any incoming state changes appropriately. It uses Immutable.js for storing the state, so all objects are return as immutable objects. It has its own `subscribe` method that can be used to register a callback that will be called whenever a state change happens.

The ChainStore has several useful methods to retrieve, among other things, objects, assets and accounts using either object ids or asset/account names. These methods are synchronous and will return `undefined` to indicate fetching in progress, and `null` to indicate that the object does not exist.

```js
import {Apis} from "peerplaysjs-ws";
import {ChainStore} from "peerplaysjs-lib";

Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise.then((res) => {
    console.log("connected to:", res[0].network);
    ChainStore.init().then(() => {
        ChainStore.subscribe(updateState);
    });
});

let dynamicGlobal = null;
function updateState(object) {
    dynamicGlobal = ChainStore.getObject("2.1.0");
    console.log("ChainStore object update\n", dynamicGlobal ? dynamicGlobal.toJS() : dynamicGlobal);
}

```

### ECC

The ECC library contains all the crypto functions for private and public keys as well as transaction creation/signing.

#### Private keys

As a quick example, here's how to generate a new private key from a seed (a brainkey for example):

```js
import {PrivateKey, key} from "peerplaysjs-lib";

let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );

console.log("\nPrivate key:", pkey.toWif());
console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```

#### Transactions

TODO transaction signing example

## ESDoc (beta)

```bash
npm i -g esdoc esdoc-es7-plugin
esdoc -c ./esdoc.json
open out/esdoc/index.html
```

## Releases

This repository uses a [standard version](https://www.npmjs.com/package/standard-version) to aid in version control and release management.

When using standard version to cut a release, there is automated changelog modifitions made based on commit messages.

```csharp
// If you typically use npm version to cut a new release, do this instead:
npm run release
// To cut a release and bump the version by major, minor, or patch, use the following respectively:
npm run release-major // major bump
npm run release-minor // minor bump
npm run release-patch // patch bump
// To cut a pre-release:
npm run pre-release // v0.2.1 to v0.2.2-rc.0
```
