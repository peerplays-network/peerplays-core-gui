import React from 'react';
import counterpart from 'counterpart';
import Translate from 'react-translate-component';
import Immutable from 'immutable';
import _ from 'lodash';
import {connect} from 'react-redux';
import {FormattedNumber} from 'react-intl';
import utils from '../../../common/utils';
import {RAccountActions} from '../../../actions';
import {bindActionCreators} from 'redux';

class Accounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: props.searchValue,
      accountsList: Immutable.List()
    };

    this.debounceOnSearchChange = _.debounce(this.accountSearch.bind(this), 500);
  }

  componentDidMount() {
    this.props.accountSearch(this.props.searchValue);
  }

  componentDidUpdate() {
    //Update accounts list once its loaded
    if(this.props.accountsList && this.state.accountsList !== this.props.accountsList) {
      this.setState({
        accountsList: this.props.accountsList
      });
    }
  }

  accountSearch() {
    this.props.accountSearch(this.state.searchValue);
  }

  componentWillUnmount() {
    this.props.accountSearch('');
  }

  onSearch(e) {
    let value = e.target.value.toLowerCase();
    this.setState({searchValue: value});
    this.debounceOnSearchChange();
  }

  render() {
    let {searchValue, accountsList} = this.state;

    let list = accountsList.map((a) => {
      let amount = a[2] / Math.pow(10, this.props.coreAsset.precision);
      let supply = parseInt(this.props.coreAsset.options.max_supply, 10);
      let percent = utils.format_number((a[2] / supply) * 100, 4);
      return (
        <div key={ a } className='tableRow'>
          <div className='tableCell'>{a[0]}</div>
          <div className='tableCell'>{a[1]}</div>
          <div className='tableCell text_r'>
            <FormattedNumber
              value={ amount }
              minimumFractionDigits={ 0 }
              maximumFractionDigits={ 5 }/> {this.props.coreAsset.symbol}
          </div>
          <div className='tableCell text_r'>{a[2]
            ? `${percent} %`
            : 'N / A'}</div>
          <div className='tableCell text_r'></div>
        </div>
      );
    });
    return (
      <div id='accounts' className='tab__deploy block'>
        <div className='tab__deployHead'>
          <div className='title col'>
            <Translate content='explore.accounts.explore_bitshares_accounts'/>
          </div>
          {/*Possible: addClass focus to div.fieldSearch__wrap*/}
          <div className='fieldWrap fieldSearch__wrap col col-3'>
            <input type='submit' className='fieldSearch__sbm'/>
            <span className='fieldSearch__icon icon-search'></span>
            <a href='' className='fieldSearch__clear'> {/* eslint-disable-line */}
              <span className='fieldSearch__clearIcon icon-close'></span>
            </a>

            <input
              type='text'
              className='field field-search'
              placeholder={ counterpart.translate('explore.accounts.search_accounts') }
              value={ this.state.searchValue }
              onChange={ this.onSearch.bind(this) }/>
          </div>
        </div>
        {searchValue
          ? <div className='box-inner box-inner-2'>
            <div className='table table2 table-explore-acc'>
              <div className='table__head tableRow'>
                <div className='tableCell'>
                  <Translate content='explore.accounts.account_name'/>
                </div>
                <div className='tableCell'>
                  <Translate content='explore.accounts.id'/>
                    #
                </div>
                <div className='tableCell text_r'>
                  <Translate content='explore.accounts.core_token_balance'/>
                </div>
                <div className='tableCell text_r'>
                  <Translate content='explore.accounts.percent_of_total_supply'/>
                </div>
                <div className='tableCell text_r'>
                </div>
              </div>
              <div className='table__body'>
                {list}
              </div>
            </div>
          </div>
          : null
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    searchValue: state.account.search.searchTerm,
    accountsList: state.account.search.searchAccounts,
    coreAsset: state.account.search.coreAsset
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    accountSearch: RAccountActions.accountSearch
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Accounts);
