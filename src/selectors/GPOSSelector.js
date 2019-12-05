const getVestingBalancesIds = (state) => state.dashboardPage.vestingBalancesIds;
const getGposBalances = (state) => state.accountVestingPageReducer.balances;
const getGposVestingLockinPeriod = (state) => state.dashboardPage.gposVestingLockinPeriod;
const getGposTotal = (state) => state.dashboardPage.gposInfo.account_vested_balance;
const getAvailableGpos = (state) => state.dashboardPage.gposInfo.allowed_withdraw_amount;

export const getCoreBalance = (state) => {
  let coreToken = state.dashboardPage.coreToken;
  return coreToken.getIn([0, 'available']);
};

export {
  getVestingBalancesIds,
  getGposBalances,
  getGposVestingLockinPeriod,
  getGposTotal,
  getAvailableGpos
};