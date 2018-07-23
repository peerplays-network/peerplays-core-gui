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

import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import { connect } from 'react-redux';
import _ from "lodash";

import AccountImage from "../Account/AccountImage";

import VotingActions from 'actions/VotingActions';
import { setTransaction } from 'actions/RTransactionConfirmActions';
import { setWalletPosition } from 'actions/RWalletUnlockActions';

import Repository from 'repositories/chain/repository';
import AccountRepository from 'repositories/AccountRepository';

import Tooltip from './Tooltip';

@connect(state => {
    return {
        account: state.app.account,
        knownProxies: state.voting.proxy.knownProxies,
        name: state.voting.proxy.name,
        id: state.voting.proxy.id,
        walletLocked: state.wallet.locked,
        walletIsOpen: state.wallet.isOpen
    };
}, {
    setWalletPosition,
    changeProxy: VotingActions.changeProxy,
    publishProxy: VotingActions.publishProxy,
    setTransaction
})
class Proxy extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // inputName : props.name ? props.name : "",
            inputName : "",
            name: props.name,
            error: null,
            requestInProcess: false
        };

        this.uniqueRequestId = null;
        this.debounceOnInputChange = _.debounce(this.checkAccount.bind(this), 500);

    }

    checkAccount() {

        if (this.state.inputName.trim().length) {
            this.verifyInputValue(this.state.inputName.trim(), this.uniqueRequestId);
        } else {
            this.setState({requestInProcess: false, error: null});
        }

    }

    onInputChange(e) {

        const GRAPHENE_MAX_ACCOUNT_NAME_LENGTH = 63;

        let value = e.target.value.trim();

        if (value.length > GRAPHENE_MAX_ACCOUNT_NAME_LENGTH) {
            value = value.substring(0, GRAPHENE_MAX_ACCOUNT_NAME_LENGTH);
        }

        if(value === this.props.account){
            this.setState({
                inputName: value,
                error: counterpart.translate('errors.cant_proxy_yourself')
            });
            return;
        }

        this.uniqueRequestId = _.uniqueId();
        this.debounceOnInputChange();

        this.setState({
            requestInProcess: true,
            inputName: value,
            error: null
        });

    }

    verifyInputValue(value, uniqueRequestId) {
        AccountRepository.fetchFullAccount(value).then(result => {

            if(!result) throw (counterpart.translate('errors.unknown_account'));

            if (this.uniqueRequestId === uniqueRequestId) {
                this.setState({
                    requestInProcess: false,
                    error: null
                });
            }


        }).catch (error => {
            if (this.uniqueRequestId === uniqueRequestId) {
                this.setState({
                    requestInProcess: false,
                    error
                });
            }
        });
    }

    onKeyDown(e) {
        if (e.keyCode === 13) this.onMakeProxy();
    }

    onSetProxy(account_id){
        Repository.getAccount(account_id).then(result => {
            this.setState({
                inputName: result.get("name")
            })
        })
    }

    onMakeProxy(walletLocked) {
        // let name = this.state.inputName;
        let name = this.state.name;

        if(walletLocked && !this.props.walletIsOpen) {
            this.props.setWalletPosition(true);
        }

        if(walletLocked) {
            return;
        } else {
            Repository.getAccount(name ? name : '1.2.5').then(result => {
                let proxy = result.toJS();
                this.props.changeProxy(proxy);
                this.props.publishProxy(proxy.id)
                .then((tr) => {
                    tr.set_required_fees('1.3.0').then(() => {
                        Repository.getAsset(tr.operations[0][1].fee.asset_id).then(asset => {
                            this.props.setTransaction('account_update', {
                                account: this.props.account,
                                transactionObject: tr,
                                voting_account: proxy.id,
                                transactionFunction: VotingActions.holdTransaction,
                                functionArguments: tr,
                                proposedOperation: `Update account for ${this.props.account}`,
                                fee: {
                                    amount: tr.operations[0][1].fee.amount,
                                    asset: asset.toJS()
                                }
                            })
                        })
                    });
                })
                .then(() => {
                    this.setState({
                        // inputName: name,
                        name: name
                    });
                })
            })
        }
    }


    componentWillReceiveProps(nextProps) {
        if(nextProps.name != this.props.name){
            this.setState({
                // inputName: nextProps.name,
                name: nextProps.name
            });
        }
        if(nextProps.walletLocked != this.props.walletLocked && this.state.inputName != this.state.name) {
            this.onMakeProxy(nextProps.walletLocked);
        }
    }

    onResetChanges() {
        this.setState({
            name: this.props.name
        });
    }

    onPublishChanges() {

    }

    onRemoveProxy() {
        this.setState({
            name: ''
        })
    }

    addProxy() {
        this.setState({
            name: this.state.inputName,
            inputName: ''
        })
    }

    render() {
        let {inputName, name, error, requestInProcess} = this.state;
        let {account} = this.props;

        let disabled = this.props.name === this.state.name;

        return (
            <div id="proxy" className="tab__deploy" style={{display: 'block'}}>
                <div className="tab__deployHead">
                    <div className="title">
                        <Translate content="votes.proxy_short" />
                        <Tooltip text={<Translate content="votes.proxy_tab.question_mark_note" />} />
                    </div>

                    <Translate component="div" className="title__sm"  content="votes.proxy_tab.help_note" />

                    <div className="row clearfix">
                        <label className="label"><Translate content="votes.proxy" /></label>
                        <div className="fieldWrap col-7">
                            <span className="fieldPic2">
                                <AccountImage size={{height: 33, width: 33}} account={inputName ? inputName : account} custom_image={null}/>
                            </span>
                            <input className={`field field-type2 field-pic ${error ? 'error' : null}`} value={inputName}
                                   onChange={this.onInputChange.bind(this)} onKeyDown={this.onKeyDown.bind(this)} placeholder={counterpart.translate("account.name")} />


                            <button type="button" className="btn btn-floatedRight btn-voteHead" onClick={this.addProxy.bind(this, this.props.walletLocked)} disabled={error || inputName === name || !inputName || requestInProcess}>
                                <Translate content="votes.make_proxy" />
                            </button>
                        </div>
                        { error ? <span className="error__hint">{error}</span> : null}

                    </div>
                </div>
                <div className="box-inner box-inner-2">

                    <div className="table2__btns text_r">
                        <button type="button" className="btn btn-neutral" onClick={this.onResetChanges.bind(this)} disabled={ disabled }>
                            <Translate content="votes.reset_changes"/>
                        </button>
                        <button type="button" className="btn btn-success" onClick={this.onMakeProxy.bind(this, this.props.walletLocked)} disabled={ disabled }>
                            <Translate content="votes.publish"/>
                        </button>
                    </div>

                    <div className="table table2 table-voting-proxy">
                        <div className="table__head tableRow">
                            <div className="tableCell">&nbsp;</div>
                            <div className="tableCell"><Translate content="votes.name"/></div>
                            <div className="tableCell text_r">
                                <div className="table__thAction"><Translate content="votes.action"/></div>
                            </div>
                        </div>
                        <div className="table__body">
                            <div className="tableRow">
                                <div className="tableCell">
                            <span className="picH32">
                                {
                                    name ?
                                        <AccountImage size={{height: 32, width: 32}} account={name} custom_image={null}/>
                                        :
                                        <Translate content="votes.none"/>
                                }

                            </span>
                                </div>
                                <div className="tableCell">{name ? name : <Translate content="votes.none"/> }</div>
                                <div className="tableCell text_r">
                                    <button type="button" className="btn btn-set" disabled={!name} onClick={this.onRemoveProxy.bind(this)} >
                                        <Translate content="votes.remove"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
}

export default Proxy;
