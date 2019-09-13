import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import {FormattedNumber} from 'react-intl';
import {Field, reduxForm} from 'redux-form';
import counterpart from 'counterpart';
import asset_utils from '../../../../common/asset_utils';

const renderField = ({
  tabIndex,
  className,
  errors,
  placeholder,
  input,
  label,
  type,
  meta: {
    touched,
    error,
    dirty // eslint-disable-line
  }
}) => (
  <label className='gpos-modal__form-row'>
    <input
      autoFocus={ tabIndex === '1' }
      autoComplete='off'
      // { ...input }
      type={ type }
      placeholder={ placeholder }
      tabIndex={ tabIndex }
      className={ (touched && error)
        ? (className + ' error')
        : className }
    />
    {(touched) && error && <span className='error__hint'>{error}</span>}
    {!error && errors && errors.length
      ? errors.map((err) => {
        return (
          <span className='error__hint' key={ err }>
            {err}
          </span>
        );
      })
      : <span className='error__hint'>&nbsp;</span>}
  </label>
);

class GposStep1 extends PureComponent {
  state = {
    amount: 0
  }

  /**
   * Increment or decrements the state amount.
   *
   * @param {number} by - the amount to adjust by
   * @memberof GposStep1
   */
  amountAdjust = (state, by) => {
    this.setState({amount: state.amount + by});
  }

  onSubmit = (e) => {
    e.preventDefault();
    console.log('submitting:');
  }

  renderAmountPicker = () => {
    let {errors} = this.props;
    return(
      <div className='gpos-modal__card--picker'>
        <button className='gpos-modal__btn-minus' onClick={ this.amountAdjust(-1) }>-</button>
        <form className='gpos-modal__form-amt-picker' id='amountPicker' onSubmit={ this.onSubmit }>
          <Field
            name='gpos_amt'
            errors={ errors }
            className='gpos-modal__input-amt'
            component={ renderField }
            placeholder={ counterpart.translate('gpos.wizard.step-1.right.placeholderAmt') }
            type='number'
            tabIndex='1'
          />
        </form>
        <button className='gpos-modal__btn-add' onClick={ this.amountAdjust(1) }>+</button>
      </div>
    );
  }

  renderPowerUp = () => {
    return(
      <div className=''>
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
    let {totalGpos, proceedOrRegress, asset} = this.props, symbol;

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
          <div className='gpos-modal__card--power'>
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.step-1.right.card-1'
            />
            <div className='balance'>
              {totalGpos && asset
                ? <FormattedNumber
                  value={ totalGpos && asset
                    ? totalGpos / Math.pow(10, asset.get('precision'))
                    : totalGpos
                  }
                  minimumFractionDigits={ 0 }
                  maximumFractionDigits={ asset.get('precision') }
                />
                : 0
              } {symbol}
            </div>
          </div>

          {
            this.renderPowerUp()
          }

          <div className='gpos-modal__card--power'>
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.step-1.right.card-2'
            />
          </div>
          <div className='gpos-modal__btns--power'>
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
  return {
    asset: state.dashboardPage.vestingAsset
  };
};

// Decorate the form component
GposStep1 = reduxForm({
  form: 'claimBtsLoginForm', // a unique name for this form,
  validate: (values) => {
    const errors = {};

    if (!values.gpos_amt) {
      // if no number, ...
      // errors.gpos_amt = counterpart.translate('errors.paste_your_redemption_key_here');
    } else {
      try {
        // validate
      } catch (e) {
        // error handle
      }
    }

    return errors;
  }
})(GposStep1);

export default connect(mapStateToProps, null)(GposStep1);