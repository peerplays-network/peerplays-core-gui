import {ApisInstance, Apis, ConnectionManager} from 'peerplaysjs-lib';
import Config from '../../config/Config';
let instances = {};
class ConnectManager {
  constructor() {
    this.blockchainUrlIndex = 0;
    this.blockchainUrls = Config.BLOCKCHAIN_URLS;
    this.sortedUrls = [];
  }

  /**
   * Close connection to blockchain and remove any related callbacks
   *
   * @memberof ConnectionService
   */
  closeConnectionToBlockchain() {
    console.log('close connection');
    Apis.close();

    // Reset the index if we've gone past the end.
    if (this.blockchainUrlIndex >= this.blockchainUrls.length) {
      this.blockchainUrlIndex = 0;
    }
  }

  /**
   * reconnect to blockchain in case of disconnect
   *
   * @memberof ConnectionService
   */
  reconnectToBlockchain() {
    // Increment the index for the next connection attempt
    this.blockchainUrlIndex++;
    const connectionString = this.sortedUrls[this.blockchainUrlIndex];

    return Apis
      .instance(connectionString, true)
      .init_promise
      .then(() => {
        console.log(`%cConnected to: ${connectionString}.`, 'background: #222 color: green; font-size: large');
      })
      .catch(() => {
        console.error(`%cConnection to: ${connectionString} failed.`, 'background: #222; color: red; font-size: large');

        return Promise.reject();
      });
  }

  /**
   * If application configuration is for mainnet, retrieve them from a cloud-based source.
   * Can be any gist or source provided it is the following format:
   * - has .js extension (for readability)
   * - structured as: const endpoints = ['wss://endpoint1', 'wss://endpoint2', etc];
   *
   * @returns {array} - mainnet API endpoints
   * @memberof ConnectManager
   */
  async getActiveWitnessEndpoints() {
    if (!Config.IS_TESTNET) {
      const endpointsGist = 'https://api.github.com/gists/024a306a5dc41fd56bd8656c96d73fd0';
      let eps;

      const clean = (values) => {
        let cleanedValues = values;

        for (let i = 0; i < values.length; i++) {
          cleanedValues[i] = cleanedValues[i].trim();
        }

        return cleanedValues;
      };

      try {
        const res = await fetch(endpointsGist);
        const data = await res.json();
        let keys = Object.keys(data.files);

        // Loop over the keys, extract the endpoints and convert to an array.
        for (let i_1 = 0; i_1 < keys.length; i_1++) {
          let key = keys[i_1];
          let content = data.files[key].content;
          eps = clean(content.replace('const endpoints = [', '').replace('];', '').replace(/'/g, '').split(','));
        }

        return eps;
      } catch (err) {
        return console.error(err);
      }
    } else {
      return this.blockchainUrls;
    }
  }

  connectToBlockchain(callback, store) {
    return this.getActiveWitnessEndpoints().then((e) => {
      this.blockchainUrls = e;
    }).then(() => {
      let wsConnectionManager = new ConnectionManager({urls: this.blockchainUrls});

      if (this.sortedUrls.length > 1) {
        return this.reconnectToBlockchain();
      } else {
        this.callback = callback;
        this.callback(store);

        return wsConnectionManager
          .sortNodesByLatency()
          .then((list) => {
            return list;
          })
          .then((list) => {
            this.sortedUrls = list;
            const connectionString = list[this.blockchainUrlIndex];

            // Display the blockchain api node that we are conencting to.
            console.log(`%cConnected to: ${connectionString}.`, 'background: #222 color: green; font-size: large');
            return Apis
              .instance(connectionString, true)
              .init_promise;
          })
          .catch((err) => {
            console.error('%cNo Available Nodes.', 'background: #222; color: red; font-size: large: ', err);

            return Promise.reject();
          });
      }
    });
  }

  /**
   * @param {string} cs
   * @param {ApisInstance} instance
   */
  setConnection(cs, instance) {
    instances[cs] = instance;
  }

  /**
   * WebSocket status callback
   * @param {function} callback
   */
  setDefaultRpcConnectionStatusCallback(callback) {
    return Apis
      .instance()
      .setRpcConnectionStatusCallback(callback);
  }

  /**
   * Connects to the blockchain with the provided connectionString.
   *
   * @param {String} connectionString
   */
  setDefaultConnection(connectionString) {
    return Apis.instance(connectionString, true);
  }

  /**
   *
   * @param {String} cs
   * @returns {*}
   */
  getConnection(cs) {
    if (!instances[cs]) {
      let instance = new ApisInstance();
      instance.connect(cs);
      ConnectManager.setConnection(cs, instance);
    }

    return instances[cs];
  }
}

export default new ConnectManager();