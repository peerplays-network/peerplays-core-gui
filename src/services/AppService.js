import {ChainStore} from 'peerplaysjs-lib';
import iDB from '../idb-instance';
import {connect} from 'react-redux';
import {listenChainStore} from './ChainStoreService';
import ConnectManager from './ConnectManager';
import AppActions from '../actions/AppActions';
import ChainStoreHeartbeater from '../app/ChainStoreHeartbeater';
import RSettingsActions from '../actions/RSettingsActions';
const initSettings = RSettingsActions.initSettings;

class AppService {
  /**
   * Init our app
   * @param store
   */
  static init(store) {
    const ConnectionCallback = (store) => {
      ConnectManager.setDefaultRpcConnectionStatusCallback((value) => {
        switch (value) {
          case 'error':
            store.dispatch(AppActions.setDisableTryAgain(false));
            store.dispatch(AppActions.setShowCantConnectStatus(true));
            AppActions.resetCache();
            break;
          case 'closed':
            store.dispatch(AppActions.setDisableTryAgain(false));
            AppActions.resetCache();
            break;
          case 'open':
            store.dispatch(AppActions.setStatus(null));
          // no default
        }
      });
    };

    let beater = new ChainStoreHeartbeater();

    beater.setHeartBeatChainStore(() => {
      store.dispatch(AppActions.setShowCantConnectStatus(true));
    });

    ChainStore.setDispatchFrequency(0);
    store.dispatch(initSettings());

    ConnectManager.connectToBlockchain(ConnectionCallback, store).then(() => {
      let db;

      try {
        db = iDB.init_instance(window.openDatabase
          ? (indexedDB)
          : indexedDB).init_promise;
        db.then(() => {
          store.dispatch(AppActions.setAppLocalDbInit(true));

          return Promise.all([]).then(() => {
            store.dispatch(AppActions.setAppLocalDbLoad(true));

            ChainStore.init().then(() => {
              listenChainStore(ChainStore, store);

              if (!store.getState().walletData.wallet &&
                (!/\/login/.test(window.location.hash) &&
                  !/\/claims\/bts/.test(window.location.hash) &&
                  !/\/sign-up/.test(window.location.hash) &&
                  !/\/about/.test(window.location.hash) &&
                  !/\/explorer/.test(window.location.hash) &&
                  !/\/exchange/.test(window.location.hash))) {
                store.dispatch(AppActions.logout());
              }


              store.dispatch(AppActions.setAppChainIsInit(true));

            }).catch((error) => {
              console.error('----- ChainStore INIT ERROR ----->', error, (new Error()).stack);
              store.dispatch(AppActions.setAppSyncFail(true));
              store.dispatch(AppActions.setDisableTryAgain(false));
              store.dispatch(AppActions.setShowCantConnectStatus(true));
            });
          });
        });
      } catch (err) {
        console.error('DB init error:', err);
        store.dispatch(AppActions.setAppSyncFail(true));
        store.dispatch(AppActions.setDisableTryAgain(false));
        store.dispatch(AppActions.setShowCantConnectStatus(true));
      }
    }).catch((error) => {
      console.error('----- App INIT ERROR ----->', error, (new Error()).stack);
      ConnectManager.closeConnectionToBlockchain();
    });
  }
}

export default connect(AppActions)(AppService);