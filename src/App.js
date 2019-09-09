import React, {Component} from 'react';
import {syncHistoryWithStore} from 'react-router-redux';
import {hot} from 'react-hot-loader/root';
import routes from './routes';
import {Router, hashHistory} from 'react-router';
import IntlStore from './stores/IntlStore' // eslint-disable-line

class App extends Component {
  render() {
    return(
      <Router
        history={ syncHistoryWithStore(hashHistory, this.props.store) }
        routes={ routes(this.props.store) }
      />
    );
  }
}

export default hot(App);