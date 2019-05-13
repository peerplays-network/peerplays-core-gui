import React from 'react';
import PropTypes from 'prop-types';
import {ConnectedRouter} from 'connected-react-router/immutable';
import {syncHistoryWithStore} from 'react-router-redux';
import routes from './routes';

const App = ({history, store}) => {
  return (
    // <ConnectedRouter history={ history }>
    <ConnectedRouter history={ syncHistoryWithStore(history, store) }>
      {routes}
    </ConnectedRouter>
  );
};

App.propTypes = {
  history: PropTypes.object
};

export default App;