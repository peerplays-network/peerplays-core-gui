import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Translate from 'react-translate-component';
import asset_utils from '../../common/asset_utils';
import {HelpActions, DashboardPageActions} from '../../actions';
import {getTotalGposBalance} from '../../selectors/GPOSSelector';
import {FormattedNumber} from 'react-intl';
import {anchors} from '../Help/HelpModal';
import AppUtils from '../../utility/AppUtils';

class GPOSPanel extends Component {
  onClickHelpLearn = (e) => {
    this.props.toggleHelpModal(true, anchors.GPOS);
    e.preventDefault();
  }

  componentDidMount() {
    this.props.fetchGposInfo();
  }

  renderGposStats = () => {
    let {asset, totalGpos, gposReward, gposPerformance} = this.props, symbol;

    if (asset) {
      symbol = asset_utils.getSymbol(asset.get('symbol'));
    }

    return (
      <div className='gpos-panel__stats'>
        <div className='gpos-panel__stats-balance'>
          <Translate content='gpos.side.info.balance'/>
          <div className='gpos-panel__stats--right'>
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

        <div className='gpos-panel__stats-perf'>
          <Translate content='gpos.side.info.performance.title'/>
          <div className='gpos-panel__stats--right'>
            <Translate content='gpos.side.info.performance.txt1'/>
          </div>
        </div>

        <div className='gpos-panel__stats-percent'>
          <Translate content='gpos.side.info.percent'/>
          <div className='gpos-panel__stats--right'>
            {gposPerformance}%
          </div>
        </div>

        <div className='gpos-panel__stats-potential'>
          <Translate content='gpos.side.info.potential'/>
          <div className='gpos-panel__stats--right'>
            {gposReward && asset
              ? <FormattedNumber
                value={ gposReward && asset
                  ? gposReward / Math.pow(10, asset.get('precision'))
                  : gposReward
                }
                minimumFractionDigits={ 0 }
                maximumFractionDigits={ asset.get('precision') }
              />
              : 0
            } {symbol}
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {totalGpos} = this.props;
    let stats = totalGpos && totalGpos > 0 ?
      this.renderGposStats() : null;
    let classModifier = totalGpos && totalGpos > 0 ? '' : '--no-stats';
    let btnString = totalGpos && totalGpos > 0 ? 'gpos.side.participate' : 'gpos.side.start';

    return (
      <div className='gpos-panel'>
        <Translate
          component='div'
          className='aside__title gpos-panel__title'
          content='gpos.side.title'
        />
        <div className='gpos-panel__desc'>
          <Translate
            component='p'
            className='gpos-panel__desc-txt'
            content='gpos.side.desc'
          />
          <Translate
            component='a'
            className='gpos-panel__desc-link'
            content='gpos.side.learn'
            onClick={ this.onClickHelpLearn }
          />
        </div>
        <button
          type='button'
          className={ `btn btn-content__head gpos-panel__btn${classModifier}` }
          // onClick={ /* open gpos wizard */ }
        >
          <img className={ `gpos-panel__img-thumb${classModifier}` } src='images/thumb-up.png' alt='thumb'/>
          <Translate content={ btnString }/>
        </button>
        {stats}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let data = getTotalGposBalance(state);
  let gposInfo = state.dashboardPage.gposInfo;
  let gposReward = gposInfo && gposInfo.award && gposInfo.award.amount;
  let vestingFactor = gposInfo && gposInfo.vesting_factor;
  let gposPerformance = AppUtils.trimNum((vestingFactor * 100 || 100), 2);

  return {
    totalGpos: data.totalAmount,
    gposReward,
    gposPerformance,
    asset: state.dashboardPage.vestingAsset
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleHelpModal: HelpActions.toggleHelpAndScroll,
    fetchGposInfo: DashboardPageActions.getGposInfo
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(GPOSPanel);