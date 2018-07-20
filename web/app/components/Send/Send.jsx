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
import { connect } from 'react-redux';
import Translate from 'react-translate-component';
import counterpart from 'counterpart';
import Select from 'react-select';
import {FormattedNumber} from 'react-intl';
import {Apis} from "peerplaysjs-ws";
import Side from '../Dashboard/Balances/Side';
import SendHistory from './SendHistory';

import SendPageActions from 'actions/SendPageActions';
import { setWalletPosition } from 'actions/RWalletUnlockActions';
import { setCurrentLocation } from 'actions/AppActions';
import { setTransaction } from 'actions/RTransactionConfirmActions';

import AccountRepository from 'repositories/AccountRepository';
import AssetRepository from 'repositories/AssetRepository';
import ObjectService from 'services/ObjectService';

import utils from 'common/utils';
import asset_utils from "common/asset_utils";
import accountUtils from 'common/account_utils';


@connect(state => {
    return {
        currentAccount: state.account.currentAccount,
        walletLocked: state.wallet.locked,
        walletIsOpen: state.wallet.isOpen,
        balance: state.sendPage.balance,
        symbols: state.sendPage.symbols,
        selectedSymbol: state.sendPage.selectedSymbol,
        assets: state.sendPage.assets,
        accountId: state.sendPage.accountId,
        history: state.sendPage.history,
        encryptedKey: (state.walletData.wallet) ? state.walletData.wallet.encrypted_brainkey : null,
        aesPrivate: state.walletData.aesPrivate
    };
}, {
    setWalletPosition,
    setCurrentLocation,
    setTransaction,
    getTransferTransaction: SendPageActions.getTransferTransaction
})
class Send extends React.Component {

    constructor(props) {
        super(props);
        this.props.setCurrentLocation('SEND');
        this.state = {
            recipientName: '',
            recipient: null,
            amount: '',
            memo: '',
            selectedSymbol: props.selectedSymbol,
            balance: props.balance,
            invalidName: null,
            invalidAmount: null
        }
    }

    onChangeSymbol(e){
        this.setState({
            selectedSymbol: e.value
        });
    }

    onInputChange(e) {
        let value = e.target.value.trim();

        if(Number(value)) {
            this.setState({
                recipientName: '',
                invalidName: null
            });
            return;
        }

        if(value === "") {
            this.setState({
                recipientName: value,
                invalidName: null
            });
            return;
        }


        if(value === this.props.currentAccount){
            this.setState({
                recipientName: value,
                invalidName: counterpart.translate("errors.cant_send_yourself")
            });
            return;
        }

        this.setState({ recipientName: value });

        this.verifyInputValue(value);
    }

    verifyInputValue(value) {
        AccountRepository.fetchFullAccount(value).then(result => {

            if(!result) throw (counterpart.translate("errors.unknown_account"));

            let account = result[1].account;

            if(this.state.recipientName === account.name) {
                this.setState({
                  recipient: account,
                  invalidName: null
                });
            }


        }).catch (error => {
            let errorMessage = "";
            if (error.data && error.data.name === 'assert_exception') {
                errorMessage = "Invalid Name";
            } else {
                errorMessage = error;
            }

            if(this.state.recipientName === value) {
                this.setState({
                  recipientName: value,
                  invalidName: errorMessage
                });
            }
        });
    }

    onAmountChange(e) {
        let amount = e.target.value.trim().replace(/[A-Za-z]/g, "").replace(/,/g,'');

        // let balance = this.props.balance.filter(item => item.symbol === this.state.selectedSymbol).map(item => item)[0];
        // let precision = Math.pow(10, balance.precision);
        //
        // if((amount) * precision > balance.balance) {
        //     this.setState({ amount, invalidAmount: 'Insufficient balance' });
        //     return;
        // }

        this.setState({ amount, invalidAmount: null });
    }

    onChangeMemo(e) {
        this.setState({
            memo: e.target.value.trim()
        });
    }

    formatAmount(v) {
        if (!v) v = "";
        if (typeof v === "number") v = v.toString();
        let value = v.trim().replace(/,/g, "");

        while (value.substring(0, 2) == "00")
            value = value.substring(1);
        if (value[0] === ".") value = "0" + value;
        else if (value.length) {
            let n = Number(value)
            if (isNaN(n)) {
                value = parseFloat(value);
                if (isNaN(value)) return "";
            }
            let parts = (value + "").split('.');
            value = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (parts.length > 1) value += "." + parts[1];
        }
        return value;
    }

    onSend(walletLocked) {
        if(walletLocked && !this.props.walletIsOpen) {
            this.props.setWalletPosition(true);
        }

        if(walletLocked) return;
        else {

            let asset = this.props.assets.filter(item => item.symbol === this.state.selectedSymbol)[0];
            let assetId = asset.id;
            let precision = utils.get_asset_precision(asset.precision);

            /**
             * Fix
             *
             * Problem:
             * 8.998 * 100000 = 899799.9999999999
             *
             * Solution:
             * 8.998 * 1000 = 8998
             * 8998 * precision / 1000
             */

            let amount,
                splitAmount = this.state.amount.split('.');

            if (splitAmount.length > 1 && splitAmount[1].length) {

                let power = splitAmount[1].length,
                    powerAmount = this.state.amount * power;

                amount = parseInt(powerAmount * precision / power, 10);

            } else {

                amount = parseInt(this.state.amount * precision, 10);

            }

            let check = this.props.balance.filter(item => {
                if(item.symbol === asset.symbol) {
                    return amount <= item.balance;
                }
                return false;
            });

            if(!check.length) {
                this.setState({invalidAmount: 'Insufficient balance'});
                return;
            }

            this.props.getTransferTransaction(
                this.props.accountId,
                this.state.recipient.id,
                amount,
                this.state.memo,
                assetId,
                assetId
            )
            .then((tr) => {
                //tr.set_required_fees().then(() => {
                    AssetRepository.fetchAssetsByIds([assetId]).then(assets => {
                    //     let fee = { amount: tr.operations[0][1].fee.amount };
                    //     if(assets[0].id === assets[1].id) {
                    //         fee = Object.assign({}, fee, {asset: assets[0]});
                    //     } else {
                    //         // let bts = assets[1].options.core_exchange_rate.base.amount / Math.pow(10, assets[0].precision);
                    //         // let currency = assets[1].options.core_exchange_rate.quote.amount / Math.pow(10, assets[1].precision);
                    //         // let btsAmount = tr.operations[0][1].fee.amount / Math.pow(10, assets[0].precision);
                    //         // let amount = bts > 0 ? (btsAmount * currency / bts) * Math.pow(10, assets[1].precision) : fee.amount;
                    //         // console.log(bts, currency, btsAmount, amount)
                    //         // tr.operations[0][1].fee = {
                    //         //     amount,
                    //         //     asset_id: assetId
                    //         // };
                    //         if(tr.operations[0][1].fee.amount / Math.pow(10, assets[1].precision) >= tr.operations[0][1].fee.amount / Math.pow(10, assets[0].precision)) {
                    //             tr.operations[0][1].fee.asset_id = assetId;
                    //             fee = Object.assign({}, fee, {asset: assets[1]});//{amount, asset: assets[1]};
                    //         }
                    //         fee = Object.assign({}, fee, {asset: assets[0]});//{amount, asset: assets[1]};
                    //     }

                        this.props.setTransaction('transfer', {
                            nameFrom: this.props.currentAccount,
                            nameTo: this.state.recipientName,
                            amount: {amount, asset},
                            fee: { amount: tr.operations[0][1].fee.amount, asset },
                            proposedOperation: `Transfer ${this.state.amount} ${asset.symbol} from ${this.props.currentAccount} to ${this.state.recipientName}`,
                            transactionFunction: SendPageActions.transferTransaction,
                            transactionFunctionCallback: () => {
                                this.setState({
                                    amount: '',
                                    recipientName: '',
                                    memo: '',
                                    invalidName: null,
                                    invalidAmount: null,

                                })
                            },
                            transactionObject: tr,
                            functionArguments: tr
                        });
                    })
                //});
            });
        }
    }


    componentWillUpdate(nextProps) {
        const {walletLocked} = this.props;
        if(!nextProps.walletLocked && nextProps.walletLocked != walletLocked && nextProps.aesPrivate) {

            this.onSend(nextProps.walletLocked);
        }

        if(!this.props.symbols &&  nextProps.symbols) {
            this.setState({selectedSymbol: nextProps.symbols[0]})
        }
        // AccountRepository.fetchFullAccount(this.props.currentAccount).then(res => {
        //     let balance = Object.values(res[1].balances);
        //     this.props.balance.map((item, index) => {
        //         if(item.balance != balance[index].balance) {
        //             this.setState({ balance: balance });
        //         }
        //     });
        // });
    }

    render() {
        let {balance, symbols, history, assets} = this.props;
        let { selectedSymbol, amount, recipientName } = this.state;

        let options = this.props.symbols.map(item => {
            return {value: item, label: asset_utils.getSymbol(item)}
        });

        let amountValue = this.formatAmount(amount);

        let availableAsset = assets.filter(obj => obj.symbol === selectedSymbol)[0];
        let availableBalance = balance.filter(item => item.symbol === selectedSymbol).map(item => item.balance)[0];

        let precision = availableAsset ? Math.pow(10, availableAsset.precision) : 5;

        let disabled = (recipientName && amount && !this.state.invalidName && !this.state.invalidAmount) ? false : true;

        return (
            <div className="main">
                <Side />
                <section className="content content-aside">
                    <div className="box">
                        <div className="content__head noBd">
                            <h1 className="content__headTitle"><Translate content="transfer.send"/></h1>
                        </div>
                        <div className="sendForm col-6">
                            <form action="#" className="">
                                <div className="row2">
                                    <label className="label"><Translate content="transfer.select_coin_or_token"/></label>
                                    <Select
                    									value={selectedSymbol}
                    									options={options}
                                      onChange={this.onChangeSymbol.bind(this)}
                    								/>
                                    <div className="fieldNote stack"><b className="mark">
                                        <FormattedNumber
                                            maximumFractionDigits={availableAsset ? availableAsset.precision : 0}
                                            value={(availableBalance && !isNaN(availableBalance / precision)) ? (availableBalance / precision) : 0}
                                        /> {asset_utils.getSymbol(selectedSymbol)}</b> <Translate content="transfer.available"/>
                                    </div>
                                </div>
                                <div className="row2">
                                    <label className="label"><Translate content="transfer.amount_to_send"/></label>
                                    <input type="text" className={`field field-type3 ${this.state.invalidAmount ? 'error' : null}`} value={amountValue} onChange={this.onAmountChange.bind(this)}/>
                                    {this.state.invalidAmount ? <span className="error__hint">{this.state.invalidAmount}</span> : null}
                                </div>
                                <div className="row2">
                                    <label className="label"><Translate content="transfer.account_name"/></label>
                                    <input type="text" className={`field field-type3 ${this.state.invalidName ? 'error' : null}`} value={recipientName} onChange={this.onInputChange.bind(this)} onBlur={this.onInputChange.bind(this)}/>
                                    {this.state.invalidName ? <span className="error__hint">{this.state.invalidName}</span> : null}
                                </div>
                                {/*<div className="row2">
                                    <label className="label"><Translate content="transfer.account_type"/></label>
                                    <Select/>
                                </div>*/}
                                <div className="row2">
                                    <label className="label"><Translate content="transfer.memo"/></label>
                                    <textarea className="textarea field field-type3" rows="1" value={this.state.memo} onChange={this.onChangeMemo.bind(this)} />
                                </div>
                                <div className="sendForm__btns">
                                    <button
                                        type="button"
                                        className="btn btn-sendForm"
                                        onClick={this.onSend.bind(this, this.props.walletLocked)}
                                        disabled={disabled}
                                    >
                                        <Translate content="transfer.send"/>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="delimiter full"></div>

                        {history ? <SendHistory accountId={this.props.accountId}/> : null}
                        <div className="h50"></div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Send;
