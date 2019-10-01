import ActionTypes from '../constants/ActionTypes';
import {PrivateKey} from 'peerplaysjs-lib';
import WalletApi from '../rpc_api/WalletApi';
import AccountRepository from '../repositories/AccountRepository';

class GPOSPrivateActions {
  static toggleGPOSModal(isShow) {
    return {
      type: ActionTypes.TOGGLE_GPOS_WIZARD,
      payload: {
        showGPOSWizardModal: isShow
      }
    };
  }
}

class GPOSActions {
  static toggleGPOSWizardModal(showGPOSWizardModal) {
    return (dispatch) => {
      dispatch(GPOSPrivateActions.toggleGPOSModal(showGPOSWizardModal));
    };
  }

  /**
   *
   *
   * @static
   * @param {*} owner
   * @param {*} amount
   * @param {*} asset_symbol
   * @memberof GPOSActions
   */
  static getPowerUpTransaction(owner, amount, asset_symbol) {
    return (dispatch, getState) => { /* eslint-disable-line */
      return new Promise((resolve, reject) => {
        const is_gpos = true;
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
          balance_type: is_gpos
        });

        tr.add_operation(power_up_op);

        return tr.set_required_fees().then(() => resolve(tr)).catch((err)=> reject(err));
      });
    };
  };

  /**
   * Broadcast a power up (create new gpos type vesting balance).
   *
   * @static
   * @param {TransactionBuild} tr
   * @returns
   * @memberof GPOSActions
   */
  static powerUpTransaction(tr) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        let encrypted_key = getState().walletData.wallet.encrypted_brainkey;
        const activePrivateKeyBuffer = getState().walletData.aesPrivate.decryptHexToBuffer(encrypted_key);
        const activePrivateKey = PrivateKey.fromBuffer(activePrivateKeyBuffer);
        AccountRepository.process_transaction(tr, activePrivateKey).then(() => resolve()).catch((err) => reject(err));
      });
    };
  }
}

export default GPOSActions;