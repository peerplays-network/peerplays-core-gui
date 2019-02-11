//unused
import React from 'react';
import Trigger from 'react-foundation-apps/src/trigger';
import Translate from 'react-translate-component';
import BindToChainState from 'components/Utility/BindToChainState';
import Post from 'common/formPost';
import utils from 'common/utils';

@BindToChainState()
class DepositModalMetaexchange extends React.Component {
  static propTypes = {
    api_root: React.PropTypes.string,
    symbol_pair: React.PropTypes.string,
    gateway: React.PropTypes.string,
    receive_asset_name: React.PropTypes.string,
    receive_asset_symbol: React.PropTypes.string,
    deposit_address: React.PropTypes.string,
    memo: React.PropTypes.string,
    is_bts_deposit: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    if (props.is_bts_deposit) {
      this.state = {
        limit: 'fetching...',
        receive_asset_name: 'Bitshares',
        receive_asset_symbol: 'BTC'
      };
    } else {
      this.state = {
        limit: 'fetching...',
        receive_asset_name: this.props.receive_asset_name,
        receive_asset_symbol: this.props.receive_asset_symbol
      };
    }
  }

  componentDidMount() {
    Post.PostForm(this.props.api_root + '/1/getMarket', {symbol_pair: this.props.symbol_pair})
      .then((reply) => reply.json().then((reply) => {
        this.setState({limit: reply.ask_max});

        if (this.props.is_bts_deposit) {
          Post.PostForm(this.props.api_root + '/2/getQuote', {
            symbol_pair: this.props.symbol_pair,
            order_type: 'buy',
            deposit_amount: 1
          })
            .then((reply) => reply.json().then((reply) => {
              this.setState({quote: reply.result});
            }));
        }
      }))
      .catch((err) => {
        console.log('metaex deposit post error:', err);
      });
  }

  render() {
    let memoName = null;

    if (this.props.receive_asset_symbol === 'ETH') {
      memoName = 'Data';
    } else if (this.props.receive_asset_symbol === 'NXT') {
      memoName = 'Message';
    }

    let memoPart = (
      <div className='content-block full-width-content'>
        <label>{memoName}</label>
        <code style={ {fontSize: '1.2rem'} } tabIndex='4'>{this.props.memo}</code>
        <div style={ {marginTop: 15} }>
          Don't forget to include this {memoName} with the transaction you send, otherwise your { /* eslint-disable-line */}
          deposit will not credit!
        </div>
      </div>
    );

    let depositPart = null;
    let depositPart2 = (
      <h3>Deposit {this.state.receive_asset_name}({this.props.receive_asset_symbol})</h3>
    );
    let quotePart = null;

    if (this.props.is_bts_deposit) {
      depositPart = depositPart2;
      quotePart = (
        <p>
          1 {this.state.receive_asset_symbol} = {utils.format_number(this.state.quote, 8)}
          {this.props.receive_asset_symbol}
        </p>
      );
    } else {
      depositPart = depositPart2;
      quotePart = '';
    }

    if (!memoName) {
      memoPart = '';
    }

    return (
      <form className='grid-block vertical full-width-content'>
        <div className='grid-container'>
          <div className='content-block'>
            {depositPart}
            <p>Deposit Bitshares by sending a transaction from your {this.props.receive_asset_name}
              wallet to the address below</p>
          </div>
          <div className='content-block full-width-content'>
            <label>Deposit address</label>
            <code tabIndex='4' style={ {
              fontSize: '1.2rem'
            } } >
              {this.props.deposit_address}
            </code>
            <p style={ {marginTop: 15} }>
              There is a deposit limit of {utils.format_number(this.state.limit, 8)} {this
                .state.receive_asset_symbol}
            </p>
            {quotePart}
          </div>

          {memoPart}
          <div className='content-block'>
            <Trigger close={ this.props.modal_id }>
              <div className='button'><Translate content='modal.ok'/></div>
            </Trigger>
          </div>
        </div>
      </form>
    );
  }
};

export default DepositModalMetaexchange;
