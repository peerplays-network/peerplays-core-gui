import React from 'react';
import PropTypes from 'prop-types';
import {History} from 'history';
import {ConnectedRouter} from 'connected-react-router/immutable';
import routes from './routes';

interface AppProps {
  history: History;
}

const App = ({history}: AppProps): JSX.Element => {
  return (
    <ConnectedRouter history={ history }>
      {routes}
    </ConnectedRouter>
  );
};

App.propTypes = {
  history: PropTypes.object
};

export default App;