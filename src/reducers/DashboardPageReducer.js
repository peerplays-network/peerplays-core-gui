import Immutable from 'immutable';
import ActionTypes from '../constants/ActionTypes';
import Config from '../../config/Config';


/**
 * Dashboard Reducer is used to controlling dashboard page
 */
let defaultState = {

  // Dashboard Data
  precision: 4,
  decimals: 4,
  coreSymbol: Config.CORE_ASSET,
  assetSymbol: Config.CORE_ASSET,
  coreToken: Immutable.List(),
  fiat: Immutable.List(),
  cryptoTokens: Immutable.List(),
  smartCoins: Immutable.List(),
  otherAssets: Immutable.List(),
  showHiddenAssets: false,
  recentActivity: [],
  openOrders: [],
  headBlockNumber: null,
  blockInterval: null,
  gposPeriod: null,
  gposSubPeriod: null,
  gposVestingLockinPeriod: null,
  availableBalances: {},

  // Vesting balance Side
  vestingBalancesIds: [],
  vestingBalances: Immutable.Map(),
  vestingAsset: null,

  // GPOS balance side
  gposBalances: Immutable.Map(),
  gposInfo: Immutable.Map(),

  // Member account
  memberAccount: null
};

export default function (state = defaultState, action) {
  switch (action.type) {
    // Dashboard Side: set vesting balances
    case ActionTypes.DASHBOARD_SET_SIDE_VESTING_BALANCES:
      return {
        ...state,
        vestingBalancesIds: action.payload.vestingBalancesIds,
        vestingBalances: action.payload.vestingBalances,
        vestingAsset: action.payload.vestingAsset
      };
    // Dashboard Side: set GPOS balances.
    case ActionTypes.DASHBOARD_SET_GPOS_BALANCES:
      return {
        ...state,
        gposBalances: action.payload.gposBalances
      };
    // Dashboard Side: set GPOS info for account.
    case ActionTypes.DAHSBOARD_SET_GPOS_INFO:
      return {
        ...state,
        gposInfo: action.payload.gposInfo
      };
    /**
     * Dashboard Side: set controlled member account
     *
     * For this account we control the change of type
     */
    case ActionTypes.DASHBOARD_SET_SIDE_MEMBER:
      return {
        ...state,
        memberAccount: action.payload.memberAccount
      };
      // Dashboard Side: Set available balances
    case ActionTypes.DASHBOARD_CHANGE_SIDE:
      return Object.assign({}, state, {
        availableBalances: action.payload.availableBalances
      });
      // set data for balances
    case ActionTypes.DASHBOARD_SET_BALANCES:
      return Object.assign({}, state, {
        coreToken: action.payload.coreToken,
        fiat: action.payload.fiat,
        cryptoTokens: action.payload.cryptoTokens,
        smartCoins: action.payload.smartCoins,
        otherAssets: action.payload.otherAssets,
        lastBlock: action.payload.lastBlock,
        coreSymbol: action.payload.coreSymbol,
        assetSymbol: action.payload.assetSymbol,
        decimals: action.payload.decimals,
        precision: action.payload.precision
      });
    case ActionTypes.DASHBOARD_UPDATE:
      return Object.assign({}, state, action.payload);
      // Show hidden assets button status
    case ActionTypes.DASHBOARD_TOGGLE_SHOW_HIDDEN_ASSETS:
      return Object.assign({}, state, {
        showHiddenAssets: action.payload.showHiddenAssets
      });
      // Set recent activity page data
    case ActionTypes.DASHBOARD_SET_RECENT_ACTIVITY:
      return Object.assign({}, state, {
        recentActivity: action.payload.recentActivity,
        headBlockNumber: action.payload.headBlockNumber,
        blockInterval: action.payload.blockInterval,
        gposPeriod: action.payload.gposPeriod,
        gposSubPeriod: action.payload.gposSubPeriod,
        gposVestingLockinPeriod: action.payload.gposVestingLockinPeriod
      });
      // Set open orders list
    case ActionTypes.DASHBOARD_SET_OPEN_ORDERS:
      return Object.assign({}, state, {
        openOrders: action.payload.openOrders
      });
      //reset to default state
    case ActionTypes.DASHBOARD_RESET:
      return Object.assign({}, state, defaultState);
    default:
      // We return the previous state in the default case
      return state;
  }
}