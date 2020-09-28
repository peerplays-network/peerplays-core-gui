import {EmitterInstance} from 'peerplaysjs-lib';
import store from '../store/configureStore';
import AppActions from '../actions/AppActions';

var hasListeners = require('event-emitter/has-listeners');

class ChainStoreHeartbeater {
  constructor() {
    this.heartBeatTimer = null;
  }

  setHeartBeatChainStore(cb) {
    let emitter = EmitterInstance.emitter();

    if(!hasListeners(emitter, 'heartbeat')) {

      emitter.on('heartbeat', () => {

        if (this.heartBeatTimer) {
          clearInterval(this.heartBeatTimer);

          if(store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain) {
            store.dispatch(AppActions.logout());
            store.dispatch(AppActions.setShowCantConnectStatus(false));
            store.dispatch(AppActions.setDisableTryAgain(false));
          }
        }

        this.heartBeatTimer = setInterval(() => {
          return cb();
        }, 30000);
      });
    }
  }
}

export default ChainStoreHeartbeater;