import ActionTypes from '../constants/ActionTypes';
import Repository from '../repositories/chain/repository';
import BalanceRepository from '../repositories/BalanceRepository';
import KeysService from '../services/KeysService';
import TransactionService from '../services/TransactionService';
import BalanceTypes from '../constants/BalanceTypes';

class AccountVestingPagePrivateActions {
  /**
   * Private Redux Action Creator (SET_ACCOUNT_VESTING_DATA)
   * Set account vesting list
   *
   * @param data
   * @returns {{type, payload: {balances}}}
   */
  static setAccountVestingDataAction(data) {
    return {
      type: ActionTypes.SET_ACCOUNT_VESTING_DATA,
      payload: data
    };
  }

  /**
   * Private Redux Action Creator (RESET_ACCOUNT_VESTING_DATA)
   * Reset page(balance list)
   * @returns {{type, payload: null}}
   */
  static resetAccountVestingDataAction() {
    return {
      type: ActionTypes.RESET_ACCOUNT_VESTING_DATA,
      payload: null
    };
  }
}
class AccountVestingPageActions {
  /**
 * Set account vesting list
 *
 * @returns {function(*=, *)}
 */
  static fetchData() {
    return (dispatch, getState) => {
      let state = getState(),
        accountId = state.app.accountId;
      Repository.getAccount(accountId).then((account) => {
        if (
          account && account.get('vesting_balances') && account.get('vesting_balances').size > 0
        ) {
          BalanceRepository.getVestingBalances(accountId).then((balances) => {
            // Process other balance types
            let otherAssetHashIds = Object.create(null),
              otherAssetsPromises = [];
            let otherBalances = balances.filter((bal) => bal.balance_type !== BalanceTypes.gpos);

            otherBalances.forEach((vb) => {
              if (!otherAssetHashIds[vb.balance.asset_id]) {
                otherAssetsPromises.push(Repository.getAsset(vb.balance.asset_id));
              }
            });

            // Process the gpos balance types
            let assetsHashIds = Object.create(null),
              assetsPromises = [];

            balances = balances.filter((bal) => bal.balance_type === BalanceTypes.gpos);
            balances.forEach((vb) => {
              if (!assetsHashIds[vb.balance.asset_id]) {
                assetsPromises.push(Repository.getAsset(vb.balance.asset_id));
              }
            });

            Promise.all(otherAssetsPromises).then((otherAssets) => {
              let otherAssetsHash = Object.create(null);
              otherAssets.forEach((asset) => {
                if (asset) {
                  otherAssetsHash[asset.get('id')] = asset;
                }
              });
              otherBalances.forEach((vb) => {
                vb.balance.asset = otherAssetsHash[vb.balance.asset_id];
              });

              Promise.all(assetsPromises).then((assets) => {
                let assetsHash = Object.create(null);
                assets.forEach((asset) => {
                  if (asset) {
                    assetsHash[asset.get('id')] = asset;
                  }
                });
                balances.forEach((vb) => {
                  vb.balance.asset = assetsHash[vb.balance.asset_id];
                });

                // Update redux store
                dispatch(AccountVestingPagePrivateActions.setAccountVestingDataAction({balances, otherBalances}));
              });
            });
          });
        } else {
          dispatch(AccountVestingPagePrivateActions.resetAccountVestingDataAction());
        }
      });
    };
  }

  /**
 *
 * Claim balances
 *
 * @param {Object} cvb
 * @param {boolean} forceAll
 * @returns {function(*=, *)}
 */
  static claimVestingBalance(cvb, forceAll = false) {
    return (dispatch, getState) => {
      let state = getState(),
        accountId = state.app.accountId;
      KeysService.getActiveKeyFromState(state, dispatch).then(() => {
        TransactionService.claimVestingBalance(accountId, cvb, forceAll, () => {
          dispatch(AccountVestingPageActions.fetchData());
        }).then((trFnc) => {
          dispatch(trFnc);
        });
      });
    };
  }

  /**
   * Reset balances
   *
   * @returns {function(*=, *)}
   */
  static resetAccountVestingData() {
    return (dispatch) => {
      dispatch(AccountVestingPagePrivateActions.resetAccountVestingDataAction());
    };
  }
}

export default AccountVestingPageActions;