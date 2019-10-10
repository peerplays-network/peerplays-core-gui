import {createSelector} from 'reselect';

const getBalancesIds = (state) => state.dashboardPage.vestingBalancesIds;
const getGposBalances = (state) => state.accountVestingPageReducer.balances;

export const getCoreBalance = (state) => {
  let coreToken = state.dashboardPage.coreToken;
  return coreToken.getIn([0, 'available']);
};

/**
 * Custom selector from multiple data sets from state.
 * Gathers all gpos balance transaction items for the user and totals them.
 */
export const getTotalGposBalance = createSelector(
  [ getBalancesIds, getGposBalances ],
  (balanceIds, balances) => {
    let totalAmount = 0;

    balances.forEach((item) => {
      let balance = item.balance.amount;
      totalAmount += balance;
    });

    return {
      totalAmount: totalAmount
    };
  }
);