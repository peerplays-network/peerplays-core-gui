import {createSelector} from 'reselect';

const getBalancesIds = (state) => state.dashboardPage.vestingBalancesIds;
const getBalances = (state) => state.dashboardPage.vestingBalances;

export const getTotalVestingBalances = createSelector(
  [ getBalancesIds, getBalances ],
  (balanceIds, balances) => {
    let totalAmount = 0,
      totalClaimable = 0;

    balanceIds.forEach((balanceId) => {
      if (balances.size > 0) {
        let balance = balances.get(balanceId);

        if (balance !== undefined) {
          let balanceAmount = balance.getIn(['balance', 'amount']),
            vestingPeriod = balance.getIn(['policy', 1, 'vesting_seconds']),
            earned = balance.getIn(['policy', 1, 'coin_seconds_earned']),
            availablePercent = earned / (vestingPeriod * balanceAmount),
            claim = balanceAmount * availablePercent;

          totalAmount += balanceAmount;
          totalClaimable += claim;
        }
      }
    });

    return {
      totalAmount: totalAmount,
      totalClaimable: totalClaimable
    };
  }
);