import ChainWebSocket from './ChainWebSocket';
import GrapheneApi from './GrapheneApi';
import ChainConfig from './ChainConfig';

let inst;

class ApisInstance {
  /** @arg {string} connection .. */
  connect(cs, connectTimeout) {
    let rpc_user = '';
    let rpc_password = '';

    if (
      typeof window !== 'undefined'
      && window.location
      && window.location.protocol === 'https:'
      && cs.indexOf('wss://') < 0
    ) {
      throw new Error('Secure domains require wss connection');
    }

    this.ws_rpc = new ChainWebSocket(cs, this.statusCb, connectTimeout);

    this.init_promise = this.ws_rpc.login(rpc_user, rpc_password).then(() => {
      console.log('Connected to API node:', cs);
      this._db = new GrapheneApi(this.ws_rpc, 'database');
      this._net = new GrapheneApi(this.ws_rpc, 'network_broadcast');
      this._hist = new GrapheneApi(this.ws_rpc, 'history');
      this._crypto = new GrapheneApi(this.ws_rpc, 'crypto');
      this._bookie = new GrapheneApi(this.ws_rpc, 'bookie');
      let db_promise = this._db.init()
        .then(() => this._db.exec('get_chain_id', []).then((_chain_id) => {
          this.chain_id = _chain_id;
          return ChainConfig.setChainId(_chain_id);
        }));

      this.ws_rpc.on_reconnect = () => {
        this.ws_rpc.login('', '').then(() => {
          this._db.init().then(() => {
            if (this.statusCb) {
              this.statusCb(ChainWebSocket.status.RECONNECTED);
            }
          });
          this._net.init();
          this._hist.init();
          this._crypto.init();
          this._bookie.init();
        });
      };

      return Promise.all([
        db_promise,
        this._net.init(),
        this._hist.init(),
        // Temporary squash crypto API error until the API is upgraded everywhere
        this._crypto.init().catch((e) => console.error('ApiInstance\tCrypto API Error', e)),
        this._bookie.init()
      ]);
    });
  }

  close() {
    if (this.ws_rpc) {
      this.ws_rpc.close();
    }

    this.ws_rpc = null;
  }

  db_api() {
    return this._db;
  }

  network_api() {
    return this._net;
  }

  history_api() {
    return this._hist;
  }

  crypto_api() {
    return this._crypto;
  }

  bookie_api() {
    return this._bookie;
  }

  setRpcConnectionStatusCallback(callback) {
    this.statusCb = callback;
  }
}

/**
    Configure: configure as follows `Apis.instance("ws://localhost:8090").init_promise`.  This
    returns a promise, once resolved the connection is ready.

    Import: import { Apis } from "@graphene/chain"

    Short-hand: Apis.db("method", "parm1", 2, 3, ...).  Returns a promise with results.

    Additional usage: Apis.instance().db_api().exec("method", ["method", "parm1", 2, 3, ...]).
    Returns a promise with results.
*/

export default {
  setRpcConnectionStatusCallback(callback) {
    this.statusCb = callback;

    if (inst) {
      inst.setRpcConnectionStatusCallback(callback);
    }
  },
  /**
        @arg {string} cs is only provided in the first call
        @return {Apis} singleton .. Check Apis.instance().init_promise to
        know when the connection is established
    */
  reset(cs = 'ws://localhost:8090', connect, connectTimeout = 4000) {
    if (inst) {
      inst.close();
      inst = null;
    }

    inst = new ApisInstance();
    inst.setRpcConnectionStatusCallback(this.statusCb);

    if (inst && connect) {
      inst.connect(
        cs,
        connectTimeout
      );
    }

    return inst;
  },
  instance(cs = 'ws://localhost:8090', connect, connectTimeout = 4000) {
    if (!inst) {
      inst = new ApisInstance();
      inst.setRpcConnectionStatusCallback(this.statusCb);
    }

    if (inst && connect) {
      inst.connect(
        cs,
        connectTimeout
      );
    }

    return inst;
  },
  chainId() {
    return this.instance().chain_id;
  },
  close() {
    if (inst) {
      inst.close();
      inst = null;
    }
  }
  // db: (method, ...args) => Apis.instance().db_api().exec(method, toStrings(args)),
  // network: (method, ...args) => Apis.instance().network_api().exec(method, toStrings(args)),
  // history: (method, ...args) => Apis.instance().history_api().exec(method, toStrings(args)),
  // crypto: (method, ...args) => Apis.instance().crypto_api().exec(method, toStrings(args))
};
