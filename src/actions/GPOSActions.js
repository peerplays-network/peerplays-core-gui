import ActionTypes from '../constants/ActionTypes';
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
      type: ActionTypes.TOGGLE_GPOS_WIZARD,
      payload: {
        showGPOSWizardModal: isShow
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
        showGPOSWizardModal: false,
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
   * @param {Boolean} showGPOSWizardModal
   * @returns
   * @memberof GPOSActions
   */
  static toggleGPOSWizardModal(showGPOSWizardModal) {
    return (dispatch) => {
      dispatch(GPOSPrivateActions.toggleGPOSModal(showGPOSWizardModal));
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
        let begin_timestamp = new Date();
        begin_timestamp = begin_timestamp.toISOString();
        let wallet_api = new WalletApi();
        let tr = wallet_api.new_transaction();

        let power_up_op = tr.get_type_operation('vesting_balance_create', {
          creator: owner,
          owner,
          amount,
          asset_symbol,
          policy: [
            0, {
              begin_timestamp
            }
          ],
          balance_type: 'gpos'
        });

        tr.add_operation(power_up_op);

        return tr.set_required_fees().then(() => resolve(tr)).catch((err)=> reject(err));
      });
    };
  };

  /**
   * Sign and broadcast a power up (create new gpos type vesting balance).
   *
   * @static
   * @param {TransactionBuild} tr
   * @returns
   * @memberof GPOSActions
   */
  static powerUpTransaction(tr) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const encrypted_key = getState().walletData.wallet.encrypted_brainkey;
        const activePrivateKeyBuffer = getState().walletData.wallet.aesPrivate.decryptHexToBuffer(encrypted_key);
        const activePrivateKey = PrivateKey.fromBuffer(activePrivateKeyBuffer);
        AccountRepository.process_transaction(tr, activePrivateKey).then(() => resolve()).catch((err) => reject(err));
      });
    };
  }
}

export default GPOSActions;