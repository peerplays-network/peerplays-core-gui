import assert from 'assert';
import {Apis, ChainConfig} from 'peerplaysjs-ws';
import {ChainStore} from '../../lib';

let coreAsset;

describe('ChainStore', () => {
  // // Connect once for all tests
  // before(() => {
  //   let promise = Apis.instance('wss://pta.blockveritas.co:8089', true).init_promise.then(() => {
  //     coreAsset = '1.3.0';
  //     ChainStore.init();
  //   });

  //   return promise;
  // });

  // // Unsubscribe everything after each test
  // afterEach(() => {
  //   ChainStore.subscribers = new Set();
  //   ChainStore.clearCache();
  // });

  // after(() => {
  //   ChainConfig.reset();
  // });

  xdescribe('Subscriptions', () => {
    it('Asset not found', () => new Promise((resolve) => {
      ChainStore.subscribe(() => {
        assert(ChainStore.getAsset('NOTFOUND') === null);
        resolve();
      });
      assert(ChainStore.getAsset('NOTFOUND') === undefined);
    }));

    it('Asset by name', () => new Promise((resolve) => {
      ChainStore.subscribe(() => {
        assert(ChainStore.getAsset(coreAsset) != null);
        resolve();
      });
      assert(ChainStore.getAsset(coreAsset) === undefined);
    }));

    it('Asset by id', () => new Promise((resolve) => {
      ChainStore.subscribe(() => {
        assert(ChainStore.getAsset('1.3.0') != null);
        resolve();
      });
      assert(ChainStore.getAsset('1.3.0') === undefined);
    }));

    it('Object by id', () => new Promise((resolve) => {
      ChainStore.subscribe(() => {
        assert(ChainStore.getAsset('2.0.0') != null);
        resolve();
      });
      assert(ChainStore.getAsset('2.0.0') === undefined);
    }));
  });
  //     ChainStore.getAccount("not found")
  //
  //     ChainStore.unsubscribe(cb)
  //     // return FetchChain("getAccount", "notfound")
  //     let cb = res => console.log('res',res)
  //     // })
  // })
});
