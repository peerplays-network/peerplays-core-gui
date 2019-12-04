import {createSelector} from 'reselect';

const getBalancesIds = (state) => state.dashboardPage.vestingBalancesIds;
const getGposBalances = (state) => state.accountVestingPageReducer.balances;
const gposVestingLockinPeriod = (state) => state.dashboardPage.gposVestingLockinPeriod;

export const getCoreBalance = (state) => {
  let coreToken = state.dashboardPage.coreToken;
  return coreToken.getIn([0, 'available']);
};

/**
 * Custom selector from multiple data sets from state.
 * Gathers all gpos balance transaction items for the user and totals them returning the total amount and the total amount that can be withdrawn.
 */
export const getTotalGposBalance = createSelector(
  [ getBalancesIds, getGposBalances, gposVestingLockinPeriod ],
  (balanceIds, balances, lockinPeriod) => {
    let totalAmount = 0;
    let availableAmount = 0;

    const canWithdraw = (bal) => { // TODO: replace once parameter for allowed_withdraw_time is available
      function addDays(date, days) {
        date.setDate(date.getDate() + days);
        return date;
      }

      let lockinPeriodDays = ((lockinPeriod / 60) / 60) / 24;
      let withdrawDate = addDays(new Date(bal.policy[1].begin_timestamp), lockinPeriodDays);

      return new Date() > withdrawDate;
    };

    balances.forEach((item) => {
      let balance = item.balance.amount;
      totalAmount += balance;

      if (canWithdraw(item)) {
        availableAmount += balance;
      }
    });

    return {
      totalAmount,
      availableAmount
    };
  }
);