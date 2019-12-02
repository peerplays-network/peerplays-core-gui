import ActionTypes from '../constants/ActionTypes';
import BalanceTypes from '../constants/BalanceTypes';
import {PrivateKey} from 'peerplaysjs-lib';
import WalletApi from '../rpc_api/WalletApi';
import AccountRepository from '../repositories/AccountRepository';

/**
 * Private actions that are only to be called within the public class GPOSActions.
 * @private
 * @class GPOSPrivateActions
 */
class GPOSPrivateActions {
  static toggleGPOSModal(isShow) {
    return {
      type: ActionTypes.TOGGLE_GPOS_MODAL,
      payload: {
        showGPOSModal: isShow
      }
    };
  }

  static setCompletedStages(stages) {
    return {
      type: ActionTypes.SET_GPOS_STAGES,
      payload: {
        completedStages: stages
      }
    };
  }

  static reset() {
    return {
      type: ActionTypes.RESET_GPOS,
      payload: {
        showGPOSModal: false,
        completedStages: {1.1: false, 1.2: false, 2: false}
      }
    };
  }
}

class GPOSActions {
  /**
   * Toggle the GPOS Modal.
   *
   * @static
   * @param {Boolean} showGPOSModal
   * @returns
   * @memberof GPOSActions
   */
  static toggleGPOSModal(showGPOSModal) {
    return (dispatch) => {
      dispatch(GPOSPrivateActions.toggleGPOSModal(showGPOSModal));
    };
  }

  /**
   * Reset the state of the GPOS Modal.
   *
   * @static
   * @returns
   * @memberof GPOSActions
   */
  static resetGPOS() {
    return (dispatch) => {
      dispatch(GPOSPrivateActions.reset());
    };
  }

  /**
   * Track completed stages of the GPOS modal through this action.
   *
   * @static
   * @param {Boolean} stageCompleted
   * @returns
   * @memberof GPOSActions
   */
  static setGposStages(stageCompleted) {
    return (dispatch, getState) => {
      let currentStages = getState().gpos.completedStages;
      let newCompletedStages = currentStages;
      newCompletedStages[stageCompleted] = true;

      dispatch(GPOSPrivateActions.setCompletedStages(newCompletedStages));
    };
  }

  /**
   * Build the transaction object required for a Power Up action.
   *
   * @static
   * @param {string} owner
   * @param {string} amount
   * @param {string} asset_symbol
   * @returns {WalletApi.new_transaction} - A transaction object that has been built for the specified blockchain method.
   * @memberof GPOSActions
   */
  static getPowerUpTransaction(owner, amount, asset_symbol) {
    return (dispatch, getState) => { /* eslint-disable-line */
      return new Promise((resolve, reject) => {
        const begin_timestamp = new Date().toISOString().replace('Z','');
        let wallet_api = new WalletApi();
        let tr = wallet_api.new_transaction();

        let powerUpOp = tr.get_type_operation('vesting_balance_create', {
          fee: {
            amount: 0,
            asset_id: '1.3.0'
          },
          creator: owner,
          owner,
          amount,
          asset_symbol,
          policy: [
            0, {
              begin_timestamp,
              vesting_cliff_seconds: 0,
              vesting_duration_seconds: 0
            }
          ],
          balance_type: BalanceTypes.gpos
        });

        tr.add_operation(powerUpOp);

        return tr.set_required_fees().then(() => resolve(tr)).catch((err)=> reject(err));
      }).catch((err) => console.error(err));
    };
  };

  static getPowerDownTransaction(owner, amount) { // id, owner, amount
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        // Helper func
        const canWithdraw = (bal) => {
          // No amount may be withdraw before the vesting_cliff_seconds value has pass since the vesting balance was created (begin_timestamp).
          // now >= begin_timestamp + vesting_cliff_seconds
          return new Date().getTime() >= ((new Date(bal.policy[1].begin_timestamp).getTime() + new Date(bal.policy[1].vesting_cliff_seconds).getTime()));
        };

        const wallet_api = new WalletApi();
        // get balances available
        const gposBalances = getState().accountVestingPageReducer.balances.filter((balance) => balance.balance_type === BalanceTypes.gpos);
        // Filter for only balances that can be withdrawn.
        const availableBalances = gposBalances.filter((balance) => canWithdraw(balance));

        // Discern which vesting balances to withdraw to meet the requested amount
        const requestedAmt = amount.amount;
        let gposBalToWithdraw = [],
          powerDownOperations = [],
          powerUpTransactions = [];
        let runningAmt = 0;

        for (let i = 0; i < availableBalances.length; i++) {
          let amt = availableBalances[i].balance.amount;
          runningAmt += amt;

          if (runningAmt <= requestedAmt) {
            gposBalToWithdraw.push(availableBalances[i].id);
          } else {
            /**
             * The requested amount may not be fulfilled with an entire transaction so, we must break up an existing vesting balance type into multiple.
             * To do this, we will withdraw a larger than necessary transaction and create a new vesting balance of GPOS type with the remainder.
             * Unfortunately, this will incur multiple transaction charges.
             */
            gposBalToWithdraw.push(availableBalances[i].id); // Include this balance despite it exceeding the requested amount.

            // Check transaction amount, calculate the diff, perform above actions.
            let diff = runningAmt - requestedAmt; // This is the remainder we need to create a new vesting balance of gpos type for.
            console.info('DIFF DETETCTED, multi-part deposit/withdrawal required.\nRequested amount: ', requestedAmt, ' Diff: ', diff);

            // Craft a new transaction to create a vesting balance type of gpos with the remainder.
            const assetSymbol = getState().dashboardPage.vestingAsset.get('symbol');
            const asset_id = availableBalances[i].balance.asset_id;
            const amount = diff;

            dispatch(GPOSActions.getPowerUpTransaction(owner, {amount, asset_id}, assetSymbol)).then((tr) => {
              powerUpTransactions.push(tr);
            });
            break;
          }
        }

        // Build array of operations including all valid withdrawals
        gposBalToWithdraw.forEach((id) => {
          let bal = availableBalances.find((bal) => bal.id === id);

          if (bal) {
            let powerDownOp = {
              fee: {
                amount: '0',
                asset_id: '1.3.0'
              },
              owner,
              vesting_balance: id,
              amount: {
                amount: Math.floor(bal.balance.amount),
                asset_id: bal.balance.asset_id
              }
            };

            powerDownOperations.push(powerDownOp);
          }
        });

        const buildTransactions = async() => {
          let transactions = [];

          for (let i = 0; i < powerDownOperations.length; i++) {
            let tr = wallet_api.new_transaction();
            tr.add_type_operation('vesting_balance_withdraw', powerDownOperations[i]);
            await tr.set_required_fees().then(() => {
              transactions.push(tr);
            }).catch((err) => reject(err));
          }

          // TODO: transaction fee checking to ensure these transactions can be done...

          // Combine any pendtoing transaction. We may have a powerUp transaction required in th event of having to break up a larger vested balance to meet the request withdrawal amount.
          return transactions.concat(powerUpTransactions);
        };

        buildTransactions().then((transactions) => resolve(transactions));
      });
    };
  }

  /**
   * Sign and broadcast a power up (create new gpos type vesting balance).
   *
   * @static
   * @param {Transaction} tr
   * @returns
   * @memberof GPOSActions
   */
  static powerTransaction(tr) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        let encrypted_key = getState().walletData.wallet.encrypted_brainkey;
        const activePrivateKeyBuffer = getState().walletData.wallet.aesPrivate.decryptHexToBuffer(encrypted_key);
        const activePrivateKey = PrivateKey.fromBuffer(activePrivateKeyBuffer);

        AccountRepository.process_transaction(tr, activePrivateKey)
          .then(() => resolve()).catch((err) => reject(err));
      });
    };
  }
}

export default GPOSActions;