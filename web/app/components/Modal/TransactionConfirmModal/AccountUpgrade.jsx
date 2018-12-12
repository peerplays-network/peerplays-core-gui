/*
 *  Copyright (c) 2015 Cryptonomex, Inc., and contributors.
 *
 *  The MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import React from 'react';
import Translate from 'react-translate-component';
import {connect} from 'react-redux';
import asset_utils from 'common/asset_utils';

@connect((state) => {
  return {
    transaction: state.transactionConfirm.transaction.transactionObject,
    account_to_upgrade: state.transactionConfirm.transaction.account_to_upgrade,
    upgrade_to_lifetime_member: state.transactionConfirm.transaction.upgrade_to_lifetime_member,
    account: state.transactionConfirm.transaction.account,
    asset: state.transactionConfirm.transaction.asset
  };
})

class AccountUpgrade extends React.Component {
  render() {
    let transaction = this.props.transaction,
      asset = this.props.asset,
      operation;
    let trx = transaction.serialize();

    if (trx.operations.length && trx.operations[0][1]) {
      operation = trx.operations[0][1];
    } else {
      return null;
    }

    let amountFeeValue = asset && operation.fee.amount
      ? operation.fee.amount / Math.pow(10, asset.precision)
      : 0;

    return (
      <div className='mConf__content'>
        <div className='mConf__table'>
          <div className='mConf__tableRow'>
            <div className='mConf__tableLeft'>
              <Translate content='explorer.block.account_upgrade' />
            </div>
            <div className='mConf__tableRight'>
              <span className='mark2'>
                {
                  this.props.account
                    ? this.props.account.get('name')
                    : this.props.account_to_upgrade
                }
              </span>
            </div>
          </div>

          <div className='mConf__tableRow'>
            <div className='mConf__tableLeft'><Translate content='explorer.block.lifetime' /></div>
            <div className='mConf__tableRight'>
              <span className='mark2'>
                {this.props.upgrade_to_lifetime_member ? 'true' : 'false'}
              </span>
            </div>
          </div>
          <div className='mConf__tableRow'>
            <div className='mConf__tableLeft'><Translate content='transfer.fee' /></div>
            <div className='mConf__tableRight'>
              <span className='mark2'>
                {
                  amountFeeValue
                    ? amountFeeValue
                    : operation.fee.amount
                } / {
                  asset
                    ? asset_utils.getSymbol(asset.symbol)
                    : operation.fee.asset_id
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountUpgrade;
