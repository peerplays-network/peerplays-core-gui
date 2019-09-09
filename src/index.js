import store from './store/configureStore';
import CONFIG from '../config/Config';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppActions from './actions/AppActions';
import App from './App';
import AppService from './services/AppService';

require('./components/Utility/Prototypes'); /*eslint-disable-line */

// Init App
AppService.init(store);

ReactDOM.render(
  <Provider store={ store }><App store={ store }/></Provider>,
  document.getElementById('content')
);

window.onunhandledrejection = (data) => {
  console.log(data);
};

if (CONFIG.__ELECTRON__) {
  let ipcRenderer = window.require('electron').ipcRenderer;

  ipcRenderer.on('window-will-close', () => {
    store.dispatch(AppActions.logout()).then(() => {
      ipcRenderer.send('window-is-logout');
    }).catch(() => {
      ipcRenderer.send('window-is-logout');
    });
  });
}