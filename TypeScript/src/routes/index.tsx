import React from 'react';
import {Route, Switch} from 'react-router';
import App from '../components/Home';

// https://github.com/supasate/connected-react-router/blob/master/examples/immutable/src/routes/index.js

const routes = (
  <>
    <Switch>
      <Route exact path='/' component={ App } />
    </Switch>
  </>
);

export default routes;
