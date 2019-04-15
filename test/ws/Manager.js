import assert from 'assert';
import {ConnectionManager} from '../lib';

let defaultUrl = 'wss://api.ppytest.blckchnd.com';
let faultyNodeList = [
  {url: 'wss://bitsqsdqsdhares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bitazdazdshares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bitshaazdzares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bit.btzadazdsabc.org/ws', location: 'Hong Kong'},
  {url: 'ws://127.0.0.1:8091', location: 'Hangzhou, China'},
  {url: 'wss://bitshares.dacplay.org:8089/ws', location: 'Hangzhou, China'},
  {url: 'wss://secure.freedomledger.com/ws', location: 'Toronto, Canada'},
  {url: 'wss://testnet.bitshares.eu/ws', location: 'Public Testnet Server (Frankfurt, Germany)'}
];

let noWorkingNodes = [
  {url: 'wss://bitsqsdqsdhares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bitazdazdshares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bitshaazdzares.openledger.info/ws', location: 'Nuremberg, Germany'},
  {url: 'wss://bit.btzadazdsabc.org/ws', location: 'Hong Kong'},
  {url: 'ws://127.23230.0.1:8091', location: 'Hangzhou, China'},
  {url: 'wss://bitshasdares.dacplay.org:8089/ws', location: 'Hangzhou, China'},
  {url: 'wss://secuasdre.freedomledger.com/ws', location: 'Toronto, Canada'},
  {
    url: 'wss://testnet.bitshares.eu/wqsdsqs',
    location: 'Public Testnet Server (Frankfurt, Germany)'
  }
];

let goodNodeList = [
  {url: defaultUrl, location: 'unknown'},
  // {url: 'wss://bit.btsabc.org/ws', location: 'Hong Kong'},
  // {url: 'wss://bts.transwiser.com/ws', location: 'Hangzhou, China'},
  // {url: 'wss://bitshares.dacplay.org:8089/ws', location: 'Hangzhou, China'},
  // {url: 'wss://openledger.hk/ws', location: 'Hong Kong'},
  // {url: 'wss://secure.freedomledger.com/ws', location: 'Toronto, Canada'},
  // {url: 'wss://testnet.bitshares.eu/ws', location: 'Public Testnet Server (Frankfurt, Germany)'}
];

describe('Connection Manager', () => {
  it('Instantiates', () => {
    let man = new ConnectionManager({
      url: defaultUrl,
      urls: faultyNodeList.map((a) => a.url)
    });
    assert.equal(man.url, defaultUrl);
  });

  it('Tries to connect default url', function test() {
    this.timeout(3000);
    let man = new ConnectionManager({
      url: defaultUrl,
      urls: faultyNodeList.map((a) => a.url)
    });
    return new Promise((resolve, reject) => {
      man
        .connect()
        .then(resolve)
        .catch(reject);
    });
  });

  it('Tries to connect to fallback', function test() {
    this.timeout(15000);
    let man = new ConnectionManager({
      url: defaultUrl,
      urls: faultyNodeList.map((a) => a.url)
    });
    return new Promise((resolve, reject) => {
      man
        .connectWithFallback()
        .then(resolve)
        .catch(reject);
    });
  });

  it('Rejects if no connections are successful ', function test() {
    this.timeout(15000);
    let man = new ConnectionManager({
      url: 'wss://invalidurl',
      urls: noWorkingNodes.map((a) => a.url)
    });
    return new Promise((resolve, reject) => {
      man
        .connectWithFallback()
        .then(reject)
        .catch(resolve);
    });
  });

  it('Can check connection times for all connections', function test() {
    this.timeout(20000);
    let man = new ConnectionManager({
      url: defaultUrl,
      urls: goodNodeList.map((a) => a.url)
    });
    return new Promise((resolve, reject) => {
      man
        .checkConnections()
        .then(resolve)
        .catch(reject);
    });
  });
});
