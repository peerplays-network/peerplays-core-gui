import Apis from './ApiInstances';
import ChainWebSocket from './ChainWebSocket';

class Manager {
  constructor({url, urls}) {
    this.url = url;
    this.urls = urls.filter((a) => a !== url);
  }

  logFailure() {
    console.error('Unable to connect to', `${this.url}, skipping to next full node API server`);
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
      this.logFailure();
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

  checkConnections(rpc_user = '', rpc_password = '', resolve, reject) {
    let connectionStartTimes = {};

    const checkFunction = (resolve, reject) => {
      let fullList = this.urls.concat(this.url);
      let connectionPromises = [];

      fullList.forEach((url) => {
        let conn = new ChainWebSocket(url, () => {});
        connectionStartTimes[url] = new Date().getTime();
        connectionPromises.push(() => conn
          .login(rpc_user, rpc_password)
          .then(() => {
            conn.close();
            return {
              [url]: new Date().getTime() - connectionStartTimes[url]
            };
          })
          .catch(() => {
            if (url === this.url) {
              this.url = this.urls[0];
            } else {
              this.urls = this.urls.filter((a) => a !== url);
            }

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
        .catch(() => this.checkConnections(rpc_user, rpc_password, resolve, reject));
    };

    if (resolve && reject) {
      checkFunction(resolve, reject);
    } else {
      return new Promise(checkFunction);
    }
  }
}

export default Manager;
