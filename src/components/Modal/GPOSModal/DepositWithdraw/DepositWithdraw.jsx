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
import ObjectService from '../../../../services/ObjectService';
import Config from '../../../../../config/Config';

class DepositWithdraw extends PureComponent {
  state = {
    amount: undefined,
    totalGpos: 0,
    availableGpos: 0,
    precision: 0,
    minAmount: 0,
    maxAmount: 0,
    fees: {
      up: 0,
      down: 0
    },
    loading: true,
    transactionStatus: null
  }

  componentDidMount() {
    // Get the associated fees for power up and power down.
    const formatAmt = (amt) => {
      return this.props.asset ? amt / Math.pow(10, this.props.asset.get('precision')) : 0;
    };

    const feePromises = [ObjectService.getFee('vesting_balance_create'), ObjectService.getFee('vesting_balance_withdraw')];
    let newFees = {};

    Promise.all(feePromises).then((fees) => {
      newFees.up = formatAmt(fees[0].fee);
      newFees.down = formatAmt(fees[1].fee);

      this.setState({
        totalGpos: this.props.totalGpos && formatAmt(this.props.totalGpos),
        availableGpos: this.props.availableGpos && formatAmt(this.props.availableGpos),
        precision: this.props.asset.get('precision'),
        minAmount: asset_utils.getMinimumAmount(this.props.asset),
        maxAmount: formatAmt(this.props.coreBalance),
        fees: newFees,
        loading: false
      });
    });
  }

  componentWillUnmount() {
    // Reset the form state and other variables.
    this.setState({
      amount: undefined,
      totalGpos: 0,
      availableGpos: 0,
      precision: 0,
      minAmount: 0,
      maxAmount: 0,
      fees: {
        up: 0,
        down: 0
      },
      loading: true
    });
  }

  componentWillUpdate(prevProps) {
    if (this.props.broadcastSuccess !== prevProps.broadcastSuccess && this.state.transactionStatus !== 'done') {
      // This is needed because transactionConfirm.broadcastSuccess will change to false shortly after being set to true on a successful transaction.
      if (this.props.broadcastSuccess || Config.gpos.fakeSucceed) {
        this.setState({transactionStatus: 'done'});
      }
    }
  }
  /**
   * Increment or decrements the state amount.
   * Activated via the plus and minus buttons on the number input.
   *
   * @param {number} by - the amount to adjust by
   * @memberof DepositWithdraw
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
      newAmt = newAmt > this.state.availableGpos ? this.state.availableGpos : newAmt;
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
   * @memberof DepositWithdraw
   */
  onSubmit = (walletLocked, e) => {
    e.preventDefault();
    let max = this.props.action === 1.2 ? this.state.totalGpos : this.state.maxAmount;

    let {asset, symbol} = this.props;

    if (this.state.amount <= max && asset) {
      let asset_id = asset.get('id');

      function transactionFunctionCallback() {
        // console.info('Transaction Success');
      }

      let amount = this.state.amount * Math.pow(10, asset.get('precision'));

      if (this.props.action === 1.1) {
        this.props.getPowerUpTransaction(
          this.props.accountId,
          {amount, asset_id},
          symbol
        ).then((tr) => {
          this.props.confirmTransaction(GPOSActions.powerTransaction, tr, transactionFunctionCallback);
        });
      } else {
        if (Config.gpos.fakeSucceed) {
          this.setState({transactionStatus: 'done'});
        } else {
          this.props.getPowerDownTransaction(
            this.props.accountId,
            {amount, asset_id}
          ).then((tr) => {
            this.props.confirmTransaction(GPOSActions.powerTransaction, tr, transactionFunctionCallback);
          });
        }
      }
    }
  }

  // Block manual key entering of 'e', '-', & '+'
  onInvalidKey = (e) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
      e.preventDefault();
    }
  }

  // Block clipboard pasted entry of 'e', 'E', '-', & '+'
  onPaste = (e) => {
    // Define regex that matches 'e', 'E', '-', & '+'
    const regex = RegExp(/[eE\-\+]/g);
    const data = e.clipboardData.getData('Text');

    if (regex.test(data)) {
      e.stopPropagation();
      e.preventDefault();
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

      // Disallow chaining of zeros
      if (parseFloat(e.target.value) === 0 && e.target.value.length > 1) {
        e.target.value = 0;
      }

      // Make sure the amount does not exceed the users balance.
      val = val.toFixed(this.state.precision);
      val = parseFloat(val);

      if (this.props.action === 1.1) {
        val = val > this.state.maxAmount ? this.state.maxAmount : val;
      } else if (this.props.action === 1.2) {
        val = val > this.state.availableGpos ? this.state.availableGpos : val;
      }
    } else {
      val = undefined;
    }

    this.setState({amount: val});
  }

  checkErrors() {
    let {fees, maxAmount, amount, totalGpos} = this.state;
    let errors = false;

    // Check for errors outside of the regular validation
    // Power Up
    if (amount !== 0) {
      if (this.props.action === 1.1) {
        if (amount > (maxAmount - fees.up)) {
          errors = true;
        }
      }

      // Power Down
      if (this.props.action === 1.2) {
        // Check if current vested balance can cover the fee
        if (totalGpos < (fees.down)) {
          // Check if current regular balance can cover the fee
          if (maxAmount < fees.down){
            errors = true;
          }
        }
      }
    }

    if (errors) {
      errors = 'gpos.transaction.lack-funds';
    } else {
      errors = '';
    }

    return errors;
  }

  renderErrors = () => {
    let errors = this.checkErrors();

    if (errors !== '') {
      return (
        <div className='gpos-modal__form-error'>
          <img className='gpos-modal__icon--error' src='images/gpos/icon-error.png' alt='err' />
          <Translate
            component='p'
            className='txt'
            content={ errors }
          />
        </div>
      );
    }
  }

  renderAmountPicker = (actionTxt) => {
    let min = this.state.minAmount;
    let max = this.props.action === 1.2 ? this.state.totalGpos : this.state.maxAmount;

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
              placeholder={ counterpart.translate('gpos.deposit-withdraw.right.placeholderAmt') }
              type='number'
              value={ this.state.amount }
              onChange={ this.onEdit }
              onBlur={ this.onEdit }
              onKeyDown={ this.onInvalidKey }
              onPaste={ this.onPaste }
              tabIndex='0'
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
    let {asset, action, proceedOrRegress, symbol, isBroadcasting, broadcastError, clearTransaction} =
      this.props, transactionStatus, transactionMsg, transactionMsgClass, clickAction, btnTxt, btnClass;
    transactionMsgClass = 'transaction-status__txt';

    let rContentCardTop = (
      action === 1.2
        ? <div className='gpos-modal__card-power--flex'>
          <div className='gpos-modal__card-power-opening'>
            <Translate
              component='p'
              className='txt'
              content='gpos.deposit-withdraw.right.card-1-open'
            />
            <div className='balance--blue-dual'>
              <FormattedNumber
                value={ this.state.totalGpos }
                minimumFractionDigits={ 0 }
                maximumFractionDigits={ asset.get('precision') }
              /> {symbol}
            </div>
          </div>

          <div className='gpos-modal__spacer--vertical'></div>

          <div className='gpos-modal__card-power-available'>
            <Translate
              component='p'
              className='txt'
              content='gpos.deposit-withdraw.right.card-1-available'
            />
            <div className='balance--blue-dual'>
              <FormattedNumber
                value={ this.state.availableGpos }
                minimumFractionDigits={ 0 }
                maximumFractionDigits={ asset.get('precision') }
              /> {symbol}
            </div>
          </div>
        </div>
        : <div className='gpos-modal__card-power'>
          <Translate
            component='p'
            className='txt'
            content='gpos.deposit-withdraw.right.card-1-open'
          />
          <div className='balance--blue'>
            <FormattedNumber
              value={ this.state.totalGpos }
              minimumFractionDigits={ 0 }
              maximumFractionDigits={ asset.get('precision') }
            /> {symbol}
          </div>
        </div>
    );

    // Default right content:
    let rContent =
      <div>
        {rContentCardTop}
        {content}
        {this.renderErrors()}

        <div className='gpos-modal__card-power'>
          <Translate
            component='p'
            className='txt'
            content='gpos.deposit-withdraw.right.card-2'
          />
          <div className='balance'>{newAmt } {symbol}</div>
        </div>
        <div className='gpos-modal__btns-power'>
          <button className='gpos-modal__btn-cancel' onClick={ () => proceedOrRegress(0) }>
            <Translate className='gpos-modal__btn-txt' content='gpos.modal.cancel'/>
          </button>
          <button disabled={ !canSubmit } className='gpos-modal__btn-submit' type='submit' form='amountPicker'>
            <Translate className='gpos-modal__btn-txt' content='gpos.modal.submit'/>
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
      btnClass = '-retry';
      // No redirect due to error(s)
      clickAction = () => null;
    } else if (this.state.transactionStatus === 'done') {
      transactionStatus = '--succeed';
      transactionMsg = action === 1.1 ? 'gpos.transaction.up.succeed' : 'gpos.transaction.down.succeed';
      btnTxt = 'gpos.transaction.next';
      btnClass = '-next';
      // Redirect to start
      clickAction = () => proceedOrRegress(0, action);
    } else if (this.state.transactionStatus === 'not available') {
      transactionStatus = '--fail';
      transactionMsg = 'gpos.transaction.down.none_available';
      transactionMsgClass = `${transactionMsgClass}-sm`;
      btnTxt = 'gpos.transaction.retry';
      btnClass = '-retry';
      // Clear state error
      clickAction = () => this.setState({transactionStatus: '', amount: undefined});
    }

    // If `true`, power down action will always appear to succeed. Dummy data
    if (Config.gpos.fakeSucceed && action === 1.2 && broadcastError) {
      transactionStatus = '--succeed';
      transactionMsg = 'gpos.transaction.down.succeed';
      btnTxt = 'gpos.transaction.next';
      btnClass = '-next';
      // Redirect to start
      clickAction = () => proceedOrRegress(0, action);
    }

    if (transactionStatus !== undefined) {
      const clickHandler = (e) => {
        e.preventDefault();
        clickAction();
        // Clear the transaction so the error and other information is reset.
        clearTransaction();
      };

      // The transaction broadcast either succeeded or failed...
      rContent =
      <div className='transaction-status'>
        <img className={ `transaction-status__img${transactionStatus}` } src={ `images/gpos/transaction${transactionStatus}.png` } alt={ transactionStatus } />
        <Translate
          component='p'
          className={ transactionMsgClass }
          content={ transactionMsg }
        />
        <div className='gpos-modal__btns'>
          <button className={ `gpos-modal__btn${btnClass}` } onClick={ clickHandler }>
            <Translate className='gpos-modal__btn-txt' content={ btnTxt }/>
          </button>
        </div>
      </div>;
    }

    return rContent;
  }

  render() {
    if (this.state.loading) {
      return <SLoader/>;
    } else {
      let {asset, action} = this.props, content, title, desc, canSubmit;
      let amt = isNaN(this.state.amount) ? 0 : this.state.amount;
      let errors = this.checkErrors();
      let actionPrefix = action === 1.1 ? 'up' : 'down';
      let bullets = [];

      for (let i=1; i <= 5; i++) {
        bullets.push(`gpos.deposit-withdraw.desc.${actionPrefix}-bullet-${i}`);
      }

      // If action 1, power up is addition else it is action 2 which is subtraction.
      let newAmt = action === 1.1 ? (this.state.totalGpos + amt) : (this.state.totalGpos - amt);
      newAmt = Number((newAmt).toFixed(asset.get('precision')));
      // If the number is whole, return. Else, remove trailing zeros.
      newAmt = Number.isInteger(newAmt) ? Number(newAmt.toFixed()) : newAmt;

      if (newAmt !== this.state.maxAmount && amt > 0 && !errors) {
        canSubmit = true;
      }

      if (action === 1.1) {
        content = this.renderAmountPicker('gpos.deposit-withdraw.right.deposit');
        title = 'gpos.deposit-withdraw.desc.title-1';
        desc = 'gpos.deposit-withdraw.desc.txt-1';
      } else if (action === 1.2) {
        content = this.renderAmountPicker('gpos.deposit-withdraw.right.withdraw');
        title = 'gpos.deposit-withdraw.desc.title-2';
        desc = 'gpos.deposit-withdraw.desc.txt-2';
      }

      return (
        <div className='gpos-modal__content'>
          <div className='gpos-modal__content-left'>
            <div className='gpos-modal__modal-desc'>
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
              <ul className='gpos-modal__modal-blts'>
                {bullets.map((bul) => {
                  return <Translate
                    component='li'
                    className='gpos-modal__modal-items'
                    content={ bul }
                  />;
                })}
              </ul>
            </div>
          </div>
          <div className='gpos-modal__content-right'>
            {this.renderRContent(canSubmit, content, newAmt)}
          </div>
        </div>
      );
    }
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
    getPowerDownTransaction: GPOSActions.getPowerDownTransaction,
    confirmTransaction: RTransactionConfirmActions.confirmTransaction,
    setWalletPosition: RWalletUnlockActions.setWalletPosition
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(DepositWithdraw);