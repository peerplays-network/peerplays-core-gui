import {Apis} from '../lib';

let coreAsset = 'PPYTEST';
let defaultUrl = 'wss://api.ppytest.blckchnd.com';

describe('Connection', () => {
  afterEach(() => {
    Apis.close();
  });

  it('Connect to Node', () => new Promise(((resolve, reject) => {
    Apis.instance(defaultUrl, true).init_promise.then(() => {
      resolve();
    }).catch((reason) => reject(reason));
  })));
});

describe('Api', () => {
  describe('Subscriptions', () => {
    beforeEach(() => Apis.instance(defaultUrl, true).init_promise);
    afterEach(() => Apis.close());

    it('Set subscribe callback', () => new Promise(((resolve, reject) => {
      function callback(obj) {
        console.log('callback obj:', obj);
        resolve();
      }

      Apis.instance()
        .db_api()
        .exec('set_subscribe_callback', [callback, true])
        .then((sub) => {
          if (sub === null) {
            resolve();
          } else {
            reject(new Error('Expected sub to equal null'));
          }
        });
    })));

    it('Market subscription', () => new Promise(((resolve, reject) => {
      function callback() {
        resolve();
      }

      Apis.instance()
        .db_api()
        .exec('subscribe_to_market', [callback, '1.3.0', '1.3.19'])
        .then((sub) => {
          if (sub === null) {
            resolve();
          } else {
            reject(new Error('Expected sub to equal null'));
          }
        });
    })));

    it('Market unsubscribe', function unsubscribe() {
      this.timeout(10000);
      return new Promise(((resolve, reject) => {
        function callback() {
          resolve();
        }

        Apis.instance()
          .db_api()
          .exec('subscribe_to_market', [callback, '1.3.0', '1.3.19'])
          .then(() => {
            Apis.instance()
              .db_api()
              .exec('unsubscribe_from_market', [callback, '1.3.0', '1.3.19'])
              .then((unsub) => {
                if (unsub === null) {
                  resolve();
                } else {
                  reject(new Error('Expected unsub to equal null'));
                }
              });
          });
      }));
    });
  });

  describe('Api methods', () => {
    // Connect once for all tests
    before(() => Apis.instance(defaultUrl, true).init_promise);

    it('Get object', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_objects', [['2.0.0']])
        .then((objects) => {
          if (objects[0].id === '2.0.0') {
            resolve();
          } else {
            reject(new Error('Expected object with id 2.0.0'));
          }
        });
    })));

    it('Get account by name', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_account_by_name', ['committee-account'])
        .then((account) => {
          if (account.id === '1.2.0' && account.name === 'committee-account') {
            resolve();
          } else {
            reject(new Error('Expected object with id 1.2.0 and name committee-account'));
          }
        });
    })));

    it('Get block', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_block', [1])
        .then((block) => {
          if (block.previous === '0000000000000000000000000000000000000000') {
            resolve();
          } else {
            reject(
              new Error(
                'Expected block with previous value of 0000000000000000000000000000000000000000'
              )
            );
          }
        });
    })));

    it('Get full accounts', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_full_accounts', [['committee-account', '1.2.0'], true])
        .then((accounts) => {
          let byName = accounts[0][1];
          let byId = accounts[1][1];

          if (byName.account.id === '1.2.0' && byId.account.name === 'committee-account') {
            resolve();
          } else {
            reject(new Error('Expected objects with id 1.2.0 and name committee-account'));
          }
        });
    })));

    it('Lookup assets by symbol', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('lookup_asset_symbols', [[coreAsset, coreAsset]])
        .then((assets) => {
          if (assets[0].symbol === coreAsset && assets[1].symbol === coreAsset) {
            resolve();
          } else {
            reject(new Error(`Expected assets with symbol ${coreAsset}`));
          }
        });
    })));

    it('List assets', () => new Promise(((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('list_assets', ['A', 5])
        .then((assets) => {
          if (assets.length > 0) {
            resolve();
          } else {
            reject(new Error(`Expected assets with symbol ${coreAsset}`));
          }
        });
    })));
  });
});
