import ActionTypes from '../constants/ActionTypes';

/**
 * Account Vesting Reducer is used to saving account vesting balances
 *
 * List of vesting balances
 * @type {{balances: Array}}
 */
let defaultState = {
  balances: [],
  otherBalances: []
};

export default function (state = defaultState, action) {
  switch (action.type) {
    // Set account vesting list
    case ActionTypes.SET_ACCOUNT_VESTING_DATA:
      return Object.assign({}, state, {
        balances: action.payload.balances,
        otherBalances: action.payload.otherBalances
      });
      // Reset page
    case ActionTypes.RESET_ACCOUNT_VESTING_DATA:
      return Object.assign({}, state, defaultState);
    default:
      // We return the previous state in the default case
      return state;
  }
}