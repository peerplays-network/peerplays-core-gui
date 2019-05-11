import ActionTypes from '../constants/ActionTypes';
import Immutable from 'immutable';
import Config from '../../config/Config';

/**
 * This reducer is used to controlling a Send page
 */
const initialState = {
  head_block_number: 0,
  block_interval: 0,
  last_irreversible_block_num: 0,
  recently_missed_count: 0,
  time: null,
  coreAsset: {},
  balance: Immutable.Map(),
  symbols: [],
  assets: [],
  accountId: null,
  history: [],
  historyAssets: Immutable.Set(),
  selectedSymbol: Config.CORE_ASSET
};

export default function (state = initialState, action) {
  switch (action.type) {
    // Set page data
    case ActionTypes.SEND_PAGE_UPDATE:
      return Object.assign({}, state, {
        head_block_number: action.payload.head_block_number,
        block_interval: action.payload.block_interval,
        last_irreversible_block_num: action.payload.last_irreversible_block_num,
        recently_missed_count: action.payload.recently_missed_count,
        time: action.payload.time,
        coreAsset: action.payload.coreAsset,
        balance: action.payload.balance,
        symbols: action.payload.symbols,
        assets: action.payload.assets,
        accountId: action.payload.accountId,
        history: action.payload.history,
        historyAssets: action.payload.historyAssets
      });
    //reset to initial state
    case ActionTypes.SEND_PAGE_RESET:
      return Object.assign({}, state, initialState);
      // Page assets <select> symbol
    case ActionTypes.SEND_PAGE_SET_SYMBOL:
      return Object.assign({}, state, {
        selectedSymbol: action.payload
      });
    default:
      // We return the previous state in the default case
      return state;
  }
}