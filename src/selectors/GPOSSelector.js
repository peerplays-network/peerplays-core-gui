import {createSelector} from 'reselect';

const getBalancesIds = (state) => state.dashboardPage.vestingBalancesIds;
const getBalances = (state) => state.dashboardPage.gposBalances;

/**
 * Custom selector from multiple data sets from state.
 * Gathers all gpos balance transaction items for the user and totals them.
 */
export const getTotalGposBalance = createSelector(
  [ getBalancesIds, getBalances ],
  (balanceIds, balances) => {
    let totalAmount = 0,
      totalClaimable = 0;

    balanceIds.forEach((balanceId) => {
      if (balances.size > 0) {
        let balance = balances.get(balanceId);

        if (balance !== undefined) {
          let balanceAmount = balance.getIn(['balance', 'amount']);
          totalAmount += balanceAmount;
        }
      }
    });

    return {
      totalAmount: totalAmount,
      totalClaimable: totalClaimable
    };
  }
);