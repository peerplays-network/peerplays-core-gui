import React from 'react';
import _ from 'lodash';
import Translate from 'react-translate-component';
import counterpart from 'counterpart';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Tooltip from './Tooltip';
import AccountImage from '../Account/AccountImage';
import LinkToAccountById from '../Blockchain/LinkToAccountById';
import FormattedAsset from '../Utility/FormattedAsset';
import {
  VotingActions, RWalletUnlockActions, RTransactionConfirmActions
} from '../../actions';
import Repository from '../../repositories/chain/repository';
import AccountRepository from '../../repositories/AccountRepository';
import {voteRender} from './VotingUtil';

class CommitteeMembers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      committeeMembers: props.approvedCMIds,
      prev_committeeMembers: props.approvedCMIds,
      inputName : '',
      requestInProcess: false,
      disabled: true,
      error: null
    };
    this.uniqueRequestId = null;
    this.debounceOnInputChange = _.debounce(this.checkAccount.bind(this), 500);
  }

  componentWillMount() {
    this.props.fetchData().then(() => {
      this.setState({witnesses: this.props.approvedCMIds});
    });
  }

  checkAccount() {
    if (this.state.inputName.trim().length) {
      this.verifyInputValue(this.state.inputName.trim(), this.uniqueRequestId);
    } else {
      this.setState({requestInProcess: false, error: null});
    }
  }

  onInputChange(e) {
    this.uniqueRequestId = _.uniqueId();
    this.debounceOnInputChange();
    const GRAPHENE_MAX_ACCOUNT_NAME_LENGTH = 63;
    let value = e.target.value.trim().toLowerCase();

    if (value.length > GRAPHENE_MAX_ACCOUNT_NAME_LENGTH) {
      value = value.substring(0, GRAPHENE_MAX_ACCOUNT_NAME_LENGTH);
    }

    this.setState({
      requestInProcess: true,
      inputName: value,
      error: null
    });
  }

  verifyInputValue(value, uniqueRequestId) {
    AccountRepository.fetchFullAccount(value).then((result) => {
      if (!result) {
        throw 'Unknown account';
      }

      let account = result[1].account;

      if (this.uniqueRequestId === uniqueRequestId) {
        return this.validateAccount(account);
      }
    }).then( (isCommitteeMember) => {
      if (isCommitteeMember) {
        throw isCommitteeMember;
      }

      if (this.uniqueRequestId === uniqueRequestId) {
        this.setState({
          requestInProcess: false,
          inputName: value,
          error: null
        });
      }
    }).catch ((error) => {
      if (this.uniqueRequestId === uniqueRequestId) {
        this.setState({
          requestInProcess: false,
          inputName: value,
          error
        });
      }
    });
  }

  onKeyDown(e) {
    if (e.keyCode === 13) {
      this.onAddSelectItem();
    }
  }

  onAddSelectItem() {
    let item = this.state.inputName;

    if (!item || this.state.error) {
      return;
    }

    Repository.getAccount(item).then((result) => {
      let id = result.get('id');
      this.onAddItem(id);
      this.setState({
        inputName: ''
      });

    });
  }

  onAddItem(item_id) {
    let committeeMembers = this.state.committeeMembers.set(item_id, item_id);
    this.setState({
      committeeMembers,
      disabled: this.checkCommitteeIsDiff(committeeMembers, this.state.prev_committeeMembers)
    });
  }

  onRemoveItem(item_id) {
    let committeeMembers = this.state.committeeMembers.filter((i) => i !== item_id);
    this.setState({
      committeeMembers,
      disabled: this.checkCommitteeIsDiff(committeeMembers, this.state.prev_committeeMembers)
    });
  }

  checkCommitteeIsDiff(committee, prev_committee) {
    let disabled = true;

    if (committee.size !== prev_committee.size) {
      disabled = false;
    } else {
      prev_committee.find((item) => {
        if (!committee.has(item)) {
          disabled = false;
          return true;
        }

        return false;
      });
    }

    return disabled;
  }


  validateAccount(account) {
    if (!account) {
      return null;
    }

    let result = this.props.activeCMObjects
      .filter((cm) => cm.committee_member_account === account.id).toArray();
    return result[0] ? null : counterpart.translate('errors.not_advisor');
  }

  onResetChanges(){
    let committeeMembers =  this.state.prev_committeeMembers;
    this.setState({committeeMembers, disabled: true});
  }

  onPublishChanges(walletLocked){
    if (walletLocked && !this.props.walletIsOpen) {
      this.props.setWalletPosition(true);
    }

    if (walletLocked) {
      return;
    } else {
      this.props.publishCM(this.state.committeeMembers).then((tr) => {
        tr.set_required_fees('1.3.0').then(() => {
          Repository.getAsset(tr.operations[0][1].fee.asset_id).then((asset) => {
            this.props.setTransaction('account_update', {
              account: this.props.account,
              transactionObject: tr,
              num_committee: this.state.committeeMembers.size,
              transactionFunction: VotingActions.holdTransaction,
              functionArguments: tr,
              transactionFunctionCallback: () => {
                this.setState({disabled: true});
                this.props.handleVote();
                this.props.setVotedCommitteeCount(this.state.committeeMembers.size);
              },
              proposedOperation: `Update account for ${this.props.account}`,
              fee: {
                amount: tr.operations[0][1].fee.amount,
                asset: asset.toJS()
              }
            });
          });
        });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.walletLocked !== this.props.walletLocked && !nextProps.walletLocked) {
      this.onPublishChanges(nextProps.walletLocked);
    }

    if (JSON.stringify(nextProps.approvedCMIds) !== JSON.stringify(this.props.approvedCMIds)) {
      this.setState({
        committeeMembers: nextProps.approvedCMIds,
        prev_committeeMembers: nextProps.approvedCMIds
      });
    }
  }

  render() {
    let {account, activeCMAccounts, asset, proxyIsEnabled} = this.props;
    let {committeeMembers, disabled, inputName, error, requestInProcess} = this.state;
    let precision = Math.pow(10, asset.precision); // eslint-disable-line
    const votedCommitteeMembers = activeCMAccounts.filter((a) => committeeMembers.has(a.id) && (a !== null));
    const unVotedCommitteeMembers = activeCMAccounts.filter((a) => !committeeMembers.has(a.id) && (a !== null));

    const committeeRender = (type, a) => {
      // Either `add` or `remove`
      const clickHandler = type === 'add' ? this.onAddItem.bind(this, a.id) : this.onRemoveItem.bind(this, a.id);
      const textDisplay = type === 'add' ? 'votes.add_witness' : 'votes.remove_witness';

      const {url, total_votes} = this.props.activeCMObjects.filter((w) => w.committee_member_account === a.id).toArray()[0];
      const link = url && url.length > 0 && url.indexOf('http') === -1 ? `http://${url}` : url;

      return (
        <div key={ a.id } className='tableRow'>
          <div className='tableCell'>
            <span className='picH32'>
              <AccountImage
                size={ {height: 32, width: 32} }
                account={ a.name }
                custom_image={ null } />
            </span>
          </div>
          <div className='tableCell'><LinkToAccountById account={ a.id } /></div>
          <div className='tableCell'>
            <a href={ link } className='tableCell__link' target='_blank'> {/* eslint-disable-line */}
              {url.length < 45 ? url : url.substr(0, 45) + '...'}
            </a>
          </div>
          <div className='tableCell text_r'>
            <FormattedAsset
              amount={ total_votes }
              asset={ asset.id }
              decimalOffset={ asset.precision } /> {asset.symbol}
          </div>
          <div className='tableCell text_r'>
            <button
              type='button'
              className='btn btn-remove'
              onClick={ clickHandler }
            >
              <Translate content={ textDisplay }/>
            </button>
          </div>
        </div>
      );
    };

    const unvoted = unVotedCommitteeMembers.toArray().map((a) => committeeRender('add', a));
    const voted = votedCommitteeMembers.toArray().map((a) => committeeRender('remove', a));

    return (
      <div id='committee' className='tab__deploy block'>
        <div className='tab__deployHead'>
          <div className='title'>
            <Translate content='votes.advisors' />
            <Tooltip text={ <Translate content='votes.advisors_tab.question_mark_note' /> } />
          </div>
          <Translate component='div' className='title__sm' content='votes.advisors_tab.help_note' />
          <div className='row'>
            <label className='label'><Translate content='votes.select_advisor'/></label>
            <label className='label'>&nbsp;</label>
            <div className='fieldWrap col-12'>
              <span className='fieldPic2'>
                <AccountImage
                  size={ {height: 33, width: 33} }
                  account={ inputName ? inputName : account }
                  custom_image={ null }/>
              </span>
              <input
                type='text'
                className={ `field field-type2 field-pic ${error ? 'error' : null}` }
                value={ inputName }
                onChange={ this.onInputChange.bind(this) }
                onKeyDown={ this.onKeyDown.bind(this) }
                placeholder={ counterpart.translate('account.name') } />
              <button
                type='button'
                className='btn btn-floatedRight btn-voteHead'
                onClick={ this.onAddSelectItem.bind(this) }
                disabled={ error || inputName === '' || requestInProcess }>
                <Translate content='votes.add_witness'/>
              </button>
            </div>
            { error ? <span className='error__hint'>{error}</span> : null}
          </div>
        </div>
        {
          activeCMAccounts.size
            ? <div className='box-inner box-inner-2'>
              <div className='table2__btns noXPad text_r'>
                <button
                  type='button'
                  className='btn btn-neutral'
                  onClick={ this.onResetChanges.bind(this) }
                  disabled={ disabled }>
                  <Translate content='votes.reset_changes'/>
                </button>
                <button
                  type='button'
                  className='btn btn-success'
                  onClick={ this.onPublishChanges.bind(this, this.props.walletLocked) }
                  disabled={ proxyIsEnabled }>
                  <Translate content='votes.publish'/>
                </button>
              </div>

              {voteRender('voteCommittee', votedCommitteeMembers, voted, unvoted, account)}
              {voteRender('unvoteCommittee', unVotedCommitteeMembers, voted, unvoted, account)}
            </div>
            : null
        }
        {this.props.renderHandlers()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.app.account,
    activeCMObjects: state.voting.committeeMembers.activeCMObjects,
    activeCMAccounts: state.voting.committeeMembers.activeCMAccounts,
    approvedCMIds: state.voting.committeeMembers.approvedCMIds,
    asset: state.voting.committeeMembers.asset,
    proxyIsEnabled: state.voting.committeeMembers.proxyIsEnabled,
    walletLocked: state.wallet.locked,
    walletIsOpen: state.wallet.isOpen,
    hasVoted: state.voting.hasVoted
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    setWalletPosition: RWalletUnlockActions.setWalletPosition,
    publishCM: VotingActions.publishCM,
    fetchData: VotingActions.fetchData,
    setVotedCommitteeCount: VotingActions.setVotedCommitteeCount,
    setTransaction: RTransactionConfirmActions.setTransaction
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(CommitteeMembers);
