import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import {FormattedNumber} from 'react-intl';
import counterpart from 'counterpart';
import {bindActionCreators} from 'redux';
import asset_utils from '../../../../common/asset_utils';
import {GPOSActions, RTransactionConfirmActions, RWalletUnlockActions} from '../../../../actions';
import {getCoreBalance} from '../../../../selectors/GPOSSelector';
import SLoader from '../../../Loaders/SLoader';

class GposStep1 extends PureComponent {
  state = {
    amount: undefined,
    totalGpos: 0,
    precision: 0,
    minAmount: asset_utils.getMinimumAmount(this.props.asset),
    maxAmount: 0
  }

  componentDidMount() {
    this.setState({
      totalGpos: this.props.totalGpos && this.props.asset ? this.props.totalGpos / Math.pow(10, this.props.asset.get('precision')) : 0,
      precision: this.props.asset.get('precision'),
      maxAmount: this.props.coreBalance / Math.pow(10, this.props.asset.get('precision'))
    });
  }

  /**
   * Increment or decrements the state amount.
   * Activated via the plus and minus buttons on the number input.
   *
   * @param {number} by - the amount to adjust by
   * @memberof GposStep1
   */
  amountAdjust = (by) => {
    let newAmt = ((isNaN(this.state.amount) ? 0 : this.state.amount) + by).toFixed(this.state.precision);

    // Check if the amount exceeds the maximum of 32 digits.
    if (newAmt.length > 32) {
      newAmt = 9.9e31;
    }

    newAmt = parseFloat(newAmt);

    if (this.props.action === 1.1) {
      newAmt = newAmt > this.state.maxAmount ? this.state.maxAmount : newAmt;
    } else if (this.props.action === 1.2) {
      newAmt = newAmt > this.state.totalGpos ? this.state.totalGpos : newAmt;
    }

    newAmt = newAmt < 0 ? 0 : newAmt;

    this.setState({amount: newAmt});
  }

  /**
   * Temporarily disabled chain calls until working.
   * Submission will emulate a successful chain call at which time the start screen card associated with the submission will have a "completed" marker on it.
   *
   * @param {boolean} walletLocked - wallet locked status, TODO: sign transaction behind the scenes to not require this check
   *
   * @memberof GposStep1
   */
  onSubmit = (walletLocked, e) => {
    e.preventDefault();

    let {asset, symbol} = this.props;

    if (this.state.amount < this.state.maxAmount && asset) {
      let asset_id = asset.get('id');

      function transactionFunctionCallback() {
        this.setState({
          amount: 0
        });
      }

      this.props.getPowerUpTransaction(
        this.props.accountId,
        {amount: this.state.amount, asset_id},
        symbol
      ).then((tr) => {
        this.props.confirmTransaction(GPOSActions.powerUpTransaction, tr, transactionFunctionCallback);
      });
    }
  }

  // Handle manually entered values here
  onEdit = (e) => {
    let val;

    // Check if the amount exceeds the maximum of 32 digits.
    if (e.target.value.length > 32) {
      val = 9.9e31;
    } else {
      val = parseFloat(e.target.value);
    }

    if (val !== '' && !isNaN(val)) {
      // Make sure we are working with a number (user can potentially edit the html input type).
      val = isNaN(val) ? 0 : val;
      // Only allow positive floats.
      val = val < 0 ? 0 : val;

      // Make sure the amount does not exceed the users balance.
      val = val.toFixed(this.state.precision);
      val = parseFloat(val);

      if (this.props.action === 1.1) {
        val = val > this.state.maxAmount ? this.state.maxAmount : val;
      } else if (this.props.action === 1.2) {
        val = val > this.state.totalGpos ? this.state.totalGpos : val;
      }
    } else {
      val = undefined;
    }

    this.setState({amount: val});
  }

  renderAmountPicker = (actionTxt) => {
    let min = this.state.minAmount;
    let max = this.state.maxAmount;
    return(
      <div className='gpos-modal__card-power--transparent tall'>
        <Translate
          component='p'
          className='txt'
          content={ actionTxt }
        />
        <div className='gpos-modal__card--picker'>
          <button className='gpos-modal__btn-minus' onClick={ () => this.amountAdjust(-min) }><div className='symbol__minus'/></button>
          <form className='gpos-modal__form-amt-picker' id='amountPicker' onSubmit={ (e) => this.onSubmit(this.props.walletLocked, e) }>
            <input
              name='gpos_amt'
              id='gpos_amt'
              className='gpos-modal__input-amt'
              placeholder={ counterpart.translate('gpos.wizard.step-1.right.placeholderAmt') }
              type='number'
              value={ this.state.amount }
              onChange={ this.onEdit }
              onBlur={ this.onEdit }
              tabIndex='1'
              min='0'
              max={ max }
              step={ min }
            />
          </form>
          <button htmlFor='gpos_amt' className='gpos-modal__btn-add disabled' onClick={ () => this.amountAdjust(min) }>
            <div className='symbol__add-1'/><div className='symbol__add-2'/>
          </button>
        </div>
      </div>
    );
  }

  renderRContent = (canSubmit, content, newAmt) => {
    let {asset, action, proceedOrRegress, symbol, isBroadcasting, broadcastError, broadcastSuccess} =
      this.props, transactionStatus, transactionMsg, clickAction, btnTxt;

    // Default right content:
    let rContent =
      <div>
        <div className='gpos-modal__card-power'>
          <Translate
            component='p'
            className='txt'
            content='gpos.wizard.step-1.right.card-1'
          />
          <div className='balance--blue'>
            <FormattedNumber
              value={ this.state.totalGpos }
              minimumFractionDigits={ 0 }
              maximumFractionDigits={ asset.get('precision') }
            /> {symbol}
          </div>
        </div>

        {content}

        <div className='gpos-modal__card-power'>
          <Translate
            component='p'
            className='txt'
            content='gpos.wizard.step-1.right.card-2'
          />
          <div className='balance'>{newAmt } {symbol}</div>
        </div>
        <div className='gpos-modal__btns-power'>
          <button className='gpos-modal__btn-cancel' onClick={ () => proceedOrRegress(0) }>
            <Translate className='gpos-modal__btn-txt' content='gpos.wizard.cancel'/>
          </button>
          <button disabled={ canSubmit } className='gpos-modal__btn-submit' type='submit' form='amountPicker'>
            <Translate className='gpos-modal__btn-txt' content='gpos.wizard.submit'/>
          </button>
        </div>
      </div>;

    // If transaction is currently being broadcasted, display loading animation.
    if (isBroadcasting) {
      rContent = <SLoader/>;
    } else if (broadcastError) {
      transactionStatus = '--fail';
      transactionMsg = action === 1.1 ? 'gpos.transaction.up.fail' : 'gpos.transaction.down.fail';
      btnTxt = 'gpos.transaction.retry';

      clickAction = null;
    } else if (broadcastSuccess) {
      transactionStatus = '--succeed';
      transactionMsg = action === 1.1 ? 'gpos.transaction.up.succeed' : 'gpos.transaction.down.succeed';
      btnTxt = 'gpos.transaction.next';
      clickAction = proceedOrRegress(2, action);
    }

    if (transactionStatus !== undefined) {
      clickAction = () => {
        // Clear the transaction so the error and other information is reset.
        this.props.clearTransaction();
        return clickAction;
      };

      // The transaction broadcast either succeeded or failed...
      rContent =
      <div className='transaction-status'>
        <img className={ `transaction-status__img${transactionStatus}` } src={ `images/gpos/transaction${transactionStatus}.png` } alt={ transactionStatus } />
        <Translate
          component='p'
          className='transaction-status__txt'
          content={ transactionMsg }
        />
        <div className='gpos-modal__btns'>
          <button className='gpos-modal__btn-retry' onClick={ () => clickAction() }>
            <Translate className='gpos-modal__btn-txt' content={ btnTxt }/>
          </button>
        </div>
      </div>;
    }

    return rContent;
  }

  render() {
    let {asset, action} = this.props, content, title, desc, canSubmit;
    let amt = isNaN(this.state.amount) ? 0 : this.state.amount;
    // If action 1, power up is addition else it is action 2 which is subtraction.
    let newAmt = action === 1.1 ? (this.state.totalGpos + amt) : (this.state.totalGpos - amt);
    newAmt = Number((newAmt).toFixed(asset.get('precision')));
    // If the number is whole, return. Else, remove trailing zeros.
    newAmt = Number.isInteger(newAmt) ? Number(newAmt.toFixed()) : newAmt;

    canSubmit = newAmt !== this.state.totalGpos && newAmt > 0 ? false : true;

    if (action === 1.1) {
      content = this.renderAmountPicker('gpos.wizard.step-1.right.deposit');
      title = 'gpos.wizard.step-1.desc.title-1';
      desc = 'gpos.wizard.step-1.desc.txt-1';
    } else if (action === 1.2) {
      content = this.renderAmountPicker('gpos.wizard.step-1.right.withdraw');
      title = 'gpos.wizard.step-1.desc.title-2';
      desc = 'gpos.wizard.step-1.desc.txt-2';
    }

    return (
      <div className='gpos-modal__content'>
        <div className='gpos-modal__content-left'>
          <div className='gpos-modal__wizard-desc'>
            <Translate
              component='div'
              className='title'
              content={ title }
            />
            <Translate
              component='p'
              className='txt'
              content={ desc }
            />
          </div>
        </div>
        <div className='gpos-modal__content-right'>
          {this.renderRContent(canSubmit, content, newAmt)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let asset = state.dashboardPage.vestingAsset;
  let symbol = asset ? asset_utils.getSymbol(asset.get('symbol')) : '';
  let coreBalance = getCoreBalance(state);
  let transactionStatus = state.transactionConfirm;
  let isBroadcasting = transactionStatus.broadcasting;
  let broadcastSuccess = transactionStatus.broadcastSuccess;
  let broadcastError = transactionStatus.broadcastError;
  return {
    walletLocked : state.wallet.locked,
    walletIsOpen : state.wallet.isOpen,
    accountName: state.account.currentAccount,
    asset,
    coreBalance,
    accountId: state.app.accountId,
    isBroadcasting,
    broadcastSuccess,
    broadcastError,
    symbol
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    clearTransaction: RTransactionConfirmActions.clearTransaction,
    getPowerUpTransaction: GPOSActions.getPowerUpTransaction,
    setTransaction: RTransactionConfirmActions.setTransaction,
    confirmTransaction: RTransactionConfirmActions.confirmTransaction,
    setWalletPosition: RWalletUnlockActions.setWalletPosition
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(GposStep1);