// import {EmitterInstance} from 'peerplaysjs-lib';
// import store from '../store/configureStore';
// import AppActions from '../actions/AppActions';

// var hasListeners = require('event-emitter/has-listeners');

// class ChainStoreHeartbeater {
//   constructor() {
//     this.heartBeatTimer = null;
//   }
//   setHeartBeatChainStore(cb) {
//     let emitter = EmitterInstance.emitter();
//     console.log('emter')

//     // if(!hasListeners(emitter, 'heartbeat')) {

//     console.log('tryagain value',this.heartBeatTimer,store.getState().app.showCantConnectModal, store.getState().app.disableTryAgain)

//     emitter.on('heartbeat', () => {
//       console.log('emter',this.heartBeatTimer)

//       console.log('tryagain value',this.heartBeatTimer,store.getState().app.account);

//       console.log('tryagain value',this.heartBeatTimer,store.getState().app.showCantConnectModal, store.getState().app.disableTryAgain)

//       if (this.heartBeatTimer) {
//         console.log('tryagain value',this.heartBeatTimer,store.getState().app.showCantConnectModal, store.getState().app.disableTryAgain)

//         clearInterval(this.heartBeatTimer);

//         if(store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain) {
//           store.dispatch(AppActions.logout());
//           store.dispatch(AppActions.setShowCantConnectStatus(false));
//           store.dispatch(AppActions.setDisableTryAgain(false));
//         }
//       }
 
//       // if(!this.heartBeatTimer){
//       //   // console.log('tryagain value',this.heartBeatTimer,store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain)        
//       //   if(store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain) {
//       //     // console.log('tryagain value')
//       //     store.dispatch(AppActions.setDisableTryAgain(false));
//       //   }
//       // }
//       this.heartBeatTimer = setInterval(() => {
//         console.log('emter');

//         setInterval(() => {
//           console.log('emter');

//           if(store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain) {
//             store.dispatch(AppActions.setDisableTryAgain(false));
//           }
//         }, 3000);
//         return cb();
//       }, 30000);
//     });
//   } 
// }

// export default ChainStoreHeartbeater;

import {EmitterInstance} from 'peerplaysjs-lib';
import store from '../store/configureStore';
import AppActions from '../actions/AppActions';

var hasListeners = require('event-emitter/has-listeners');

class ChainStoreHeartbeater {
  constructor() {
    this.heartBeatTimer = null;
    this.oldHeartBeat = null;
    this.timerWait = 30000;
  }

  setHeartBeatChainStore(cb,bc) {
    let emitter = EmitterInstance.emitter();

    if(!hasListeners(emitter, 'heartbeat')) {
      emitter.on('heartbeat', () => {
        console.log('emter',this.heartBeatTimer);

        if (this.heartBeatTimer) {
          clearInterval(this.heartBeatTimer);
          console.log('emter',this.heartBeatTimer,this.oldHeartBeat);

          if(store.getState().app.showCantConnectModal ) {
         
            store.dispatch(AppActions.logout());
            store.dispatch(AppActions.setShowCantConnectStatus(false));
            store.dispatch(AppActions.setDisableTryAgain(false));
          }
        }

        this.heartBeatTimer = setInterval(() => {
          console.log('emter',this.heartBeatTimer);
          this.timerWait= store.getState().app.account?3000:30000;

          // if(!this.heartBeatTimer) {

          // setInterval(() => {

          //   if(store.getState().app.showCantConnectModal && store.getState().app.disableTryAgain) {
          //     store.dispatch(AppActions.setDisableTryAgain(false));
          //   }
          // }, 3000); 
          // }
          console.log('timer',store.getState().app.account?3000:30000)
          return cb();
        }, store.getState().app.account?5000:30000);
        console.log(store.getState().app.account,'emter',typeof this.timerWait,this.timerWait)
      });
    }
  }
}

export default ChainStoreHeartbeater;