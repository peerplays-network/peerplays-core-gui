import App from './App';
import configureStore, {history} from './store/configureStore';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

const initialState = Immutable.Map();
// Initialize store
const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={ store }>
    <App history={ history } />
  </Provider>,
  document.getElementById('content')
);