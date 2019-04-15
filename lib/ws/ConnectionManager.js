import Apis from './ApiInstances';
import ChainWebSocket from './ChainWebSocket';

class ConnectionManager {
  constructor({url, urls}) {
    this.url = url;
    this.urls = urls.filter((a) => a !== url);
  }

  logFailure(url) {
    console.error('Unable to connect to', `${url}, skipping to next full node API server`);
  }

  isURL(str) {
    /* eslint-disable-next-line */
    const endpointPattern = new RegExp('((^(?:ws(s)?:\\/\\/)|(?:http(s)?:\\/\\/))+((?:[^\\/\\/\\.])+\\??(?:[-\\+=&;%@.\\w_]*)((#?(?:[\\w])*)(:?[0-9]*))))');

    return endpointPattern.test(str);
  }

  connect(connect = true, url = this.url) {
    return new Promise((resolve, reject) => {
      Apis.instance(url, connect)
        .init_promise.then(resolve)
        .catch((error) => {
          Apis.instance().close();
          reject(error);
        });
    });
  }

  connectWithFallback(connect = true, url = this.url, index = 0, resolve = null, reject = null) {
    if (reject && index > this.urls.length - 1) {
      return reject(
        new Error(
          `Tried ${index + 1} connections, none of which worked: ${JSON.stringify(
            this.urls.concat(this.url)
          )}`
        )
      );
    }

    const fallback = (resolve, reject) => {
      this.logFailure(url);
      return this.connectWithFallback(connect, this.urls[index], index + 1, resolve, reject);
    };

    if (resolve && reject) {
      return this.connect(connect, url)
        .then(resolve)
        .catch(() => {
          fallback(resolve, reject);
        });
    }

    return new Promise((resolve, reject) => {
      this.connect(connect)
        .then(resolve)
        .catch(() => {
          fallback(resolve, reject);
        });
    });
  }

  ping(conn, resolve, reject) {
    let connectionStartTimes = {};
    let url = conn.serverAddress;

    if (!this.isURL(url)) {
      throw Error('URL NOT VALID', url);
    }

    connectionStartTimes[url] = new Date().getTime();

    const doPing = (resolve, reject) => {
      // Pass in blank rpc_user and rpc_password.
      conn.login('', '')
        .then((result) => {
          // Make sure connection is closed as it is simply a health check
          if (result) {
            conn.close();
          }

          let urlLatency = {[url]: new Date().getTime() - connectionStartTimes[url]};
          resolve(urlLatency);
        }).catch((err) => {
          console.warn('PING ERROR: ', err);
          reject(err);
        });
    };

    if (resolve && reject) {
      doPing(resolve, reject);
    } else {
      return new Promise(doPing);
    }
  }

  /**
  * sorts the nodes into a list based on latency
  * @memberof ConnectionManager
  */
  sortNodesByLatency(resolve, reject) {
    let latencyList = this.checkConnections();

    // Sort list by latency
    const checkFunction = (resolve, reject) => {
      latencyList.then((response) => {
        let sortedList = Object.keys(response).sort((a, b) => response[a] - response[b]);
        resolve(sortedList);
      }).catch((err) => {
        reject(err);
      });
    };

    if (resolve && reject) {
      checkFunction(resolve, reject);
    } else {
      return new Promise(checkFunction);
    }
  }

  checkConnections(resolve, reject) {
    const checkFunction = (resolve, reject) => {
      let fullList = this.urls;
      let connectionPromises = [];

      fullList.forEach((url) => {
        let conn = new ChainWebSocket(url, () => {});

        connectionPromises.push(() => this.ping(conn)
          .then((urlLatency) => urlLatency)
          .catch(() => {
            conn.close();
            return null;
          }));
      });

      Promise.all(connectionPromises.map((a) => a()))
        .then((res) => {
          resolve(
            res.filter((a) => !!a).reduce((f, a) => {
              let key = Object.keys(a)[0];
              f[key] = a[key];
              return f;
            }, {})
          );
        })
        .catch(() => this.checkConnections(resolve, reject));
    };

    if (resolve && reject) {
      checkFunction(resolve, reject);
    } else {
      return new Promise(checkFunction);
    }
  }
}

export default ConnectionManager;
