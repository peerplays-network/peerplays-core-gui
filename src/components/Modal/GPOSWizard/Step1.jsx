import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import {FormattedNumber} from 'react-intl';
import asset_utils from '../../../common/asset_utils';

class GposStep1 extends PureComponent {
  renderPowerUp = () => {

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
          <div className='gpos-modal__card--power'>
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.step-1.right.card-2'
            />
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

export default connect(mapStateToProps, null)(GposStep1);