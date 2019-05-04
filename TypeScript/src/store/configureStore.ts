import {Store, applyMiddleware, createStore, compose} from 'redux';
import {createBrowserHistory} from 'history';
import {routerMiddleware} from 'connected-react-router';
import {composeWithDevTools} from 'redux-devtools-extension';
import createRootReducer from '../reducers';
import thunk from 'redux-thunk';

// Session history
export const history = createBrowserHistory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function configureStore(preloadedState: any): Store {
  // Define var for filtering actions when debugging redux to reduce clutter and increase performance.
  let actionsWhitelist: string[] = [];

  // Configure enhancer for redux dev tools extensions (if available)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composeEnhancer: typeof compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeWithDevTools({
    features: {
      dispatch: true
    },
    // Option for immutable
    // serialize: {immutable: Immutable}, // TODO: figure out the typescript equiv
    actionsWhitelist: actionsWhitelist
  });

  // Construct enhancer
  const enhancer = composeEnhancer(
    applyMiddleware(thunk, routerMiddleware(history))
  );

  const store = createStore(
    createRootReducer(history),
    preloadedState,
    enhancer
  );

  return store;
}