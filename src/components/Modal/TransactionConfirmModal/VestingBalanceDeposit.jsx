import React from 'react';
import Translate from 'react-translate-component';
import {connect} from 'react-redux';

class VestingBalanceDeposit extends React.Component {
  render() {
    let {transaction, asset} = this.props;
    let trx = transaction.serialize();
    let operation;

    if (trx.operations.length && trx.operations[0][1]) {
      operation = trx.operations[0][1];
    } else {
      return null;
    }

    let amountValue = asset && operation.amount.amount
      ? operation.amount.amount
      : 0;

    let amountFeeValue = asset && operation.fee.amount
      ? operation.fee.amount / Math.pow(10, asset.precision)
      : 0;

    return (
      <div className='mConf__content'>
        <div className='mConf__table'>
          <div className='mConf__tableRow'>
            <div className='mConf__tableLeft'><Translate content='transfer.amount' /></div>
            <div className='mConf__tableRight'>
              <span className='mark2'>
                {amountValue} / {asset.get('symbol')}
              </span>
            </div>
          </div>
          <div  className='mConf__tableRow'>
            <div className='mConf__tableLeft'><Translate content='transfer.fee' /></div>
            <div className='mConf__tableRight'>
              <span className='mark2'>
                {
                  amountFeeValue
                    ? amountFeeValue
                    : operation.fee.amount
                } / {asset.get('symbol')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    asset: state.transactionConfirm.transaction.asset,
    account: state.transactionConfirm.transaction.account,
    transaction: state.transactionConfirm.transaction.transactionObject
  };
};

export default connect(mapStateToProps)(VestingBalanceDeposit);
