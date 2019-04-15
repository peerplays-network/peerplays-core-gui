let SOCKET_DEBUG = false;
let WebSocketClient = null;

if (typeof WebSocket !== 'undefined') {
  WebSocketClient = WebSocket;
} else {
  WebSocketClient = require('ws'); // eslint-disable-line global-require
}

const SUBSCRIBE_OPERATIONS = [
  'set_subscribe_callback',
  'subscribe_to_market',
  'broadcast_transaction_with_callback',
  'set_pending_transaction_callback'
];

const UNSUBSCRIBE_OPERATIONS = ['unsubscribe_from_market', 'unsubscribe_from_accounts'];

const HEALTH_CHECK_INTERVAL = 10000;

class ChainWebSocket {
  /**
   *Creates an instance of ChainWebSocket.
   * @param {string}    serverAddress           The address of the websocket to connect to.
   * @param {function}  statusCb                Called when status events occur.
   * @param {number}    [connectTimeout=10000]  The time for a connection attempt to complete.
   * @memberof ChainWebSocket
   */
  constructor(serverAddress, statusCb, connectTimeout = 10000) {
    this.statusCb = statusCb;
    this.serverAddress = serverAddress;
    this.timeoutInterval = connectTimeout;

    // The currenct connection state of the websocket.
    this.connected = false;
    this.reconnectTimeout = null;

    // Callback to execute when the websocket is reconnected.
    this.on_reconnect = null;

    // An incrementing ID for each request so that we can pair it with the
    // response from the websocket.
    this.cbId = 0;

    // Objects to store key/value pairs for callbacks, subscription callbacks
    // and unsubscribe callbacks.
    this.cbs = {};
    this.subs = {};
    this.unsub = {};

    // Current connection promises' rejection
    this.currentResolve = null;
    this.currentReject = null;

    // Health check for the connection to the BlockChain.
    this.healthCheck = null;

    // Copy the constants to this instance.
    this.status = ChainWebSocket.status;

    // Bind the functions to the instance.
    this.onConnectionOpen = this.onConnectionOpen.bind(this);
    this.onConnectionClose = this.onConnectionClose.bind(this);
    this.onConnectionTerminate = this.onConnectionTerminate.bind(this);
    this.onConnectionError = this.onConnectionError.bind(this);
    this.onConnectionTimeout = this.onConnectionTimeout.bind(this);
    this.createConnection = this.createConnection.bind(this);
    this.createConnectionPromise = this.createConnectionPromise.bind(this);
    this.listener = this.listener.bind(this);

    // Create the initial connection the blockchain.
    this.createConnection();
  }

  /**
   * Create the connection to the Blockchain.
   *
   * @returns
   * @memberof ChainWebSocket
   */
  createConnection() {
    this.debug('!!! ChainWebSocket create connection');

    // Clear any possible reconnect timers.
    this.reconnectTimeout = null;

    // Create the promise for this connection
    if (!this.connect_promise) {
      this.connect_promise = new Promise(this.createConnectionPromise);
    }

    // Attempt to create the websocket
    try {
      this.ws = new WebSocketClient(this.serverAddress);
    } catch (error) {
      // Set a timeout to try and reconnect here.
      return this.resetConnection();
    }

    this.addEventListeners();

    // Handle timeouts to the websocket's initial connection.
    this.connectionTimeout = setTimeout(this.onConnectionTimeout, this.timeoutInterval);
  }

  /**
   * Reset the connection to the BlockChain.
   *
   * @memberof ChainWebSocket
   */
  resetConnection() {
    // Close the Websocket if its still 'half-open'
    this.close();

    // Make sure we only ever have one timeout running to reconnect.
    if (!this.reconnectTimeout) {
      this.debug('!!! ChainWebSocket reset connection', this.timeoutInterval);
      this.reconnectTimeout = setTimeout(this.createConnection, this.timeoutInterval);
    }

    // Reject the current promise if there is one.
    if (this.currentReject) {
      this.currentReject(new Error(`Connection attempt failed: ${this.serverAddress}`));
    }
  }

  /**
   * Add event listeners to the WebSocket.
   *
   * @memberof ChainWebSocket
   */
  addEventListeners() {
    this.debug('!!! ChainWebSocket add event listeners');
    this.ws.addEventListener('open', this.onConnectionOpen);
    this.ws.addEventListener('close', this.onConnectionClose);
    this.ws.addEventListener('error', this.onConnectionError);
    this.ws.addEventListener('message', this.listener);
  }

  /**
   * Remove the event listers from the WebSocket. Its important to remove the event listerers
   * for garbaage collection. Because we are creating a new WebSocket on each connection attempt
   * any listeners that are still attached could prevent the old sockets from
   * being garbage collected.
   *
   * @memberof ChainWebSocket
   */
  removeEventListeners() {
    this.debug('!!! ChainWebSocket remove event listeners');
    this.ws.removeEventListener('open', this.onConnectionOpen);
    this.ws.removeEventListener('close', this.onConnectionClose);
    this.ws.removeEventListener('error', this.onConnectionError);
    this.ws.removeEventListener('message', this.listener);
  }

  /**
   * A function that is passed to a new promise that stores the resolve and reject callbacks
   * in the state.
   *
   * @param {function} resolve A callback to be executed when the promise is resolved.
   * @param {function} reject A callback to be executed when the promise is rejected.
   * @memberof ChainWebSocket
   */
  createConnectionPromise(resolve, reject) {
    this.debug('!!! ChainWebSocket createPromise');
    this.currentResolve = resolve;
    this.currentReject = reject;
  }

  /**
   * Called when a new Websocket connection is opened.
   *
   * @memberof ChainWebSocket
   */
  onConnectionOpen() {
    this.debug('!!! ChainWebSocket Connected ');

    this.connected = true;

    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;

    // This will trigger the login process as well as some additional setup in ApiInstances
    if (this.on_reconnect) {
      this.on_reconnect();
    }

    if (this.currentResolve) {
      this.currentResolve();
    }

    if (this.statusCb) {
      this.statusCb(ChainWebSocket.status.OPEN);
    }
  }

  /**
   * called when the connection attempt times out.
   *
   * @memberof ChainWebSocket
   */
  onConnectionTimeout() {
    this.debug('!!! ChainWebSocket timeout');
    this.onConnectionClose(new Error('Connection timed out.'));
  }

  /**
   * Called when the Websocket is not responding to the health checks.
   *
   * @memberof ChainWebSocket
   */
  onConnectionTerminate() {
    this.debug('!!! ChainWebSocket terminate');
    this.onConnectionClose(new Error('Connection was terminated.'));
  }

  /**
   * Called when the connection to the Blockchain is closed.
   *
   * @param {*} error
   * @memberof ChainWebSocket
   */
  onConnectionClose(error) {
    this.debug('!!! ChainWebSocket Close ', error);

    this.resetConnection();

    if (this.statusCb) {
      this.statusCb(ChainWebSocket.status.CLOSED);
    }
  }

  /**
   * Called when the Websocket encounters an error.
   *
   * @param {*} error
   * @memberof ChainWebSocket
   */
  onConnectionError(error) {
    this.debug('!!! ChainWebSocket On Connection Error ', error);

    this.resetConnection();

    if (this.statusCb) {
      this.statusCb(ChainWebSocket.status.ERROR);
    }
  }

  /**
   * Entry point to make RPC calls on the BlockChain.
   *
   * @param {array} params An array of params to be passed to the rpc call. [method, ...params]
   * @returns A new promise for this specific call.
   * @memberof ChainWebSocket
   */
  call(params) {
    if (!this.connected) {
      this.debug('!!! ChainWebSocket Call not connected. ');
      return Promise.reject(new Error('Disconnected from the BlockChain.'));
    }

    this.debug('!!! ChainWebSocket Call connected. ', params);

    let request = {
      method: params[1],
      params,
      id: this.cbId + 1
    };

    this.cbId = request.id;

    if (SUBSCRIBE_OPERATIONS.includes(request.method)) {
      // Store callback in subs map
      this.subs[request.id] = {
        callback: request.params[2][0]
      };

      // Replace callback with the callback id
      request.params[2][0] = request.id;
    }

    if (UNSUBSCRIBE_OPERATIONS.includes(request.method)) {
      if (typeof request.params[2][0] !== 'function') {
        throw new Error('First parameter of unsub must be the original callback');
      }

      let unSubCb = request.params[2].splice(0, 1)[0];

      // Find the corresponding subscription
      for (let id in this.subs) { // eslint-disable-line
        if (this.subs[id].callback === unSubCb) {
          this.unsub[request.id] = id;
          break;
        }
      }
    }

    if (!this.healthCheck) {
      this.healthCheck = setTimeout(this.onConnectionTerminate.bind(this), HEALTH_CHECK_INTERVAL);
    }

    return new Promise((resolve, reject) => {
      this.cbs[request.id] = {
        time: new Date(),
        resolve,
        reject
      };

      // Set all requests to be 'call' methods.
      request.method = 'call';

      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        this.debug('Caught a nasty error : ', error);
      }
    });
  }

  /**
   * Called when messages are received on the Websocket.
   *
   * @param {*} response The message received.
   * @memberof ChainWebSocket
   */
  listener(response) {
    let responseJSON = null;

    try {
      responseJSON = JSON.parse(response.data);
    } catch (error) {
      responseJSON.error = `Error parsing response: ${error.stack}`;
      this.debug('Error parsing response: ', response);
    }

    // Clear the health check timeout, we've just received a healthy response from the server.
    if (this.healthCheck) {
      clearTimeout(this.healthCheck);
      this.healthCheck = null;
    }

    let sub = false;
    let callback = null;

    if (responseJSON.method === 'notice') {
      sub = true;
      responseJSON.id = responseJSON.params[0];
    }

    if (!sub) {
      callback = this.cbs[responseJSON.id];
    } else {
      callback = this.subs[responseJSON.id].callback;
    }

    if (callback && !sub) {
      if (responseJSON.error) {
        this.debug('----> responseJSON : ', responseJSON);
        callback.reject(responseJSON.error);
      } else {
        callback.resolve(responseJSON.result);
      }

      delete this.cbs[responseJSON.id];

      if (this.unsub[responseJSON.id]) {
        delete this.subs[this.unsub[responseJSON.id]];
        delete this.unsub[responseJSON.id];
      }
    } else if (callback && sub) {
      callback(responseJSON.params[1]);
    } else {
      this.debug('Warning: unknown websocket responseJSON: ', responseJSON);
    }
  }

  /**
   * Login to the Blockchain.
   *
   * @param {string} user Username
   * @param {string} password Password
   * @returns A promise that is fulfilled after login.
   * @memberof ChainWebSocket
   */
  login(user, password) {
    this.debug('!!! ChainWebSocket login.', user, password);
    return this.connect_promise.then(() => this.call([1, 'login', [user, password]]));
  }

  /**
   * Close the connection to the Blockchain.
   *
   * @memberof ChainWebSocket
   */
  close() {
    if (this.ws) {
      this.removeEventListeners();

      // Try and fire close on the connection.
      this.ws.close();

      // Clear our references so that it can be garbage collected.
      this.ws = null;
    }

    // Clear our timeouts for connection timeout and health check.
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;

    clearTimeout(this.healthCheck);
    this.healthCheck = null;

    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;

    // Toggle the connected flag.
    this.connected = false;
  }

  debug(...params) {
    if (SOCKET_DEBUG) {
      console.log.apply(null, params);
    }
  }
}

// Constants for STATE
ChainWebSocket.status = {
  RECONNECTED: 'reconnected',
  OPEN: 'open',
  CLOSED: 'closed',
  ERROR: 'error'
};

export default ChainWebSocket;
