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
   * @returns {Transaction} - A transaction object that has been built for the specified blockchain method.
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

  /**
   * Builds the required Power Down transaction (vesting_balance_withdraw)
   *
   * @static
   * @param {string} owner
   * @param {object} amount - {amount, asset_id}
   * @returns {Transaction}
   * @memberof GPOSActions
   */
  static getPowerDownTransaction(owner, amount) { // id, owner, amount
    return (dispatch, getState) => { /* eslint-disable-line */
      return new Promise((resolve, reject) => {
        const wallet_api = new WalletApi();

        // Discern which vesting balances to withdraw to meet the requested amount
        const requestedAmt = amount.amount;
        const requestedAsset = amount.asset_id;
        const dummyVestingBalanceId = '1.13.2';

        let powerDownOp = {
          fee: {
            amount: '0',
            asset_id: '1.3.0'
          },
          owner,
          vesting_balance: dummyVestingBalanceId, // will be ignored for gpos vesting balances
          amount: {
            amount: Math.floor(requestedAmt),
            asset_id: requestedAsset
          },
          balance_type: BalanceTypes.gpos
        };

        // Build transaction
        let tr = wallet_api.new_transaction();
        tr.add_type_operation('vesting_balance_withdraw', powerDownOp);
        tr.set_required_fees().then(() => resolve(tr)).catch((err) => reject(err));
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