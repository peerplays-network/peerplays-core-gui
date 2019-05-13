import AppActions from './actions/AppActions';
import {Provider} from 'react-redux';
import configureStore, {history} from './store/configureStore';
import React from 'react';
import ReactDOM from 'react-dom';
import CONFIG from '../config/Config';

import App from './App';
// Initialize store
const store = configureStore();

const render = () => {
  ReactDOM.render(
    <Provider store={ store }>
      <App history={ history } store={ store }/>
    </Provider>,
    document.getElementById('content')
  );
};

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

render();

// ReactDOM.render(<App />, document.getElementById('content'));
