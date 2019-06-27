import Immutable from 'immutable';
import ActionTypes from '../constants/ActionTypes';
import Config from '../../config/Config';

/**
 * Settings reducer is used to controlling Site settings
 */

const initialState = {
  /*general*/
  locale: 'en',
  showSettles: false,
  disableChat: false,
  /*permissions*/
  ownerKeyPermissions: null,
  /*API access*/
  connection: Config.BLOCKCHAIN_URLS[0],
  faucetAddress: Config.BLOCKCHAIN_URLS[0],
  unit: Config.CORE_ASSET,
  defaults: {
    locale: [
      'en',
      'cn'
      // "fr",
      // "ko",
      // "de",
      // "es",
      // "tr"
    ],
    unit: [
      Config.CORE_ASSET
      //"SMARTSMART"
      // "CNY",
      //  "PIXEL.BITCOIN"
      // "EUR",
      // "GBP"
    ],
    preferredBases: [Config.CORE_ASSET, 'PIXEL.BITCOIN', 'PIXEL.STEEM'],
    topMarkets: [
      'PIXEL.BITCOIN', 'PIXEL.STEEM', 'BTS', 'OPEN.ETH', 'ICOO', 'BTC', 'OPEN.LISK',
      'OPEN.STEEM', 'OPEN.DAO', 'PEERPLAYS', 'USD', 'CNY', 'BTSR', 'OBITS',
      'OPEN.DGD', 'EUR', 'TRADE.BTC', 'CASH.BTC', 'GOLD', 'SILVER'
    ]
  },
  hiddenAssets: Immutable.List([])

};


export default function (state = initialState, action) {
  switch (action.type) {
    /**
     * Set initial settings
     */
    case ActionTypes.INIT_SETTINGS:
      return Object.assign({}, state, action.payload.newSettings);
      /**
       * Change settings language
       */
    case ActionTypes.SWITCH_LOCALE:
      return Object.assign({}, state, {
        locale: action.payload
      });
      /**
       * show|hide settles
       */
    case ActionTypes.CHANGE_SETTLE_STATUS:
      return Object.assign({}, state, {
        showSettles: action.payload
      });
      /**
       * show|hide chat
       */
    case ActionTypes.CHANGE_CHAT_STATUS:
      return Object.assign({}, state, {
        disableChat: action.payload
      });
      /**
       * change unit //TODO::rm
       */
    case ActionTypes.CHANGE_UNIT:
      return Object.assign({}, state, {
        unit: action.payload
      });
      /**
       * change hidden assets
       */
    case ActionTypes.CHANGE_HIDDEN_ASSETS:
      return Object.assign({}, state, {
        hiddenAssets: action.payload
      });
      /**
       * add OwnerKey Permissions TODO::rm
       */
    case ActionTypes.ADD_OWNER_KEY:
      return {
        ...state,
        ownerKeyPermissions: state.ownerKeyPermissions ?
          state.ownerKeyPermissions.concat(action.payload) :
          action.payload
      };
    default:
      /**
       * We return the previous state in the default case
       */
      return state;
  }
}