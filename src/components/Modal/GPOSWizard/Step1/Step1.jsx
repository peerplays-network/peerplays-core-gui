import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import {FormattedNumber} from 'react-intl';
import counterpart from 'counterpart';
import asset_utils from '../../../../common/asset_utils';

class GposStep1 extends PureComponent {
  state = {
    amount: 0,
    totalGpos: this.props.totalGpos && this.props.asset ? this.props.totalGpos / Math.pow(10, this.props.asset.get('precision')) : 0,
    precision: this.props.asset.get('precision'),
    minAmount: asset_utils.getMinimumAmount(this.props.asset),
    maxAmount: this.props.totalGpos / Math.pow(10, this.props.asset.get('precision'))
  }

  /**
   * Increment or decrements the state amount.
   *
   * @param {number} by - the amount to adjust by
   * @memberof GposStep1
   */
  amountAdjust = (by) => {
    let newAmt = parseFloat((this.state.amount + by).toFixed(this.state.precision));
    newAmt = newAmt > this.state.maxAmount ? this.state.maxAmount : newAmt;
    newAmt = newAmt < 0 ? 0 : newAmt;
    this.setState({amount: newAmt});
  }

  onSubmit = (e) => {
    e.preventDefault();
    console.log('submitting:');
  }

  onEdit = (e) => {
    let val = parseFloat(e.target.value);

    if (val !== '' && !isNaN(val)) {
      // Make sure we are working with a number (user can potentially edit the html input type).
      val = isNaN(val) ? 0 : val;
      // Only allow positive floats.
      val = val < 0 ? 0 : val;

      // Make sure the amount does not exceed the users balance.
      val = val.toFixed(this.state.precision);
      val = parseFloat(val);
      val = val > this.state.maxAmount ? this.state.maxAmount : val;
      e.target.value = val;
      this.setState({amount: val});
    }
  }

  renderAmountPicker = () => {
    let min = this.state.minAmount;
    let max = this.state.maxAmount;
    return(
      <div className='gpos-modal__card--picker'>
        <button className='gpos-modal__btn-minus' onClick={ () => this.amountAdjust(-min) }><div className='symbol__minus'/></button>
        <form className='gpos-modal__form-amt-picker' id='amountPicker' onSubmit={ this.onSubmit }>
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
        <button htmlFor='gpos_amt' className='gpos-modal__btn-add' onClick={ () => this.amountAdjust(min) }>
          <div className='symbol__add-1'/><div className='symbol__add-2'/>
        </button>
      </div>
    );
  }

  renderPowerUp = () => {
    return(
      <div className='gpos-modal__card-power--transparent'>
        <Translate
          component='p'
          className='txt'
          content='gpos.wizard.step-1.right.deposit'
        />
        {this.renderAmountPicker()}
      </div>
    );
  }

  renderPowerDown = () => {

  }

  render() {
    let {proceedOrRegress, asset} = this.props, symbol;

    if (asset) {
      symbol = asset_utils.getSymbol(asset.get('symbol'));
    }

    return (
      <div className='gpos-modal__content'>
        <div className='gpos-modal__content-left'>
          <div className='gpos-modal__wizard-desc'>
            <Translate
              component='div'
              className='title'
              content='gpos.wizard.step-1.desc.title'
            />
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.step-1.desc.txt-1'
            />
          </div>
        </div>
        <div className='gpos-modal__content-right'>
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

          {
            this.renderPowerUp()
          }

          <div className='gpos-modal__card-power'>
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.step-1.right.card-2'
            />
            <div className='balance'>{ this.state.totalGpos - this.state.amount} {symbol}</div>
          </div>
          <div className='gpos-modal__btns-power'>
            <button className='gpos-modal__btn-skip' onClick={ () => proceedOrRegress(2) }>
              <Translate className='gpos-modal__btn-txt' content='gpos.wizard.skip'/>
            </button>
            <button className='gpos-modal__btn-cancel' onClick={ () => proceedOrRegress(0) }>
              <Translate className='gpos-modal__btn-txt' content='gpos.wizard.cancel'/>
            </button>
            <button className='gpos-modal__btn-submit' type='submit' form='amountPicker'>
              <Translate className='gpos-modal__btn-txt' content='gpos.wizard.submit'/>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let asset = state.dashboardPage.vestingAsset;

  return {
    asset
  };
};

export default connect(mapStateToProps, null)(GposStep1);