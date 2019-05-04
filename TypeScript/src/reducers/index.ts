import {combineReducers} from 'redux-immutable';
import {History} from 'history';
import {RouterState, connectRouter} from 'connected-react-router';

const rootReducer = (history: History) => combineReducers({
  router: connectRouter(history)
});

export interface State {
  router: RouterState;
}

export default rootReducer;