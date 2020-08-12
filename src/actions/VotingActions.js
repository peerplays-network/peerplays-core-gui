import Repository from '../repositories/chain/repository';
import Immutable from 'immutable';
import counterpart from 'counterpart';
import asset_utils from '../common/asset_utils';
import {ChainStore, PrivateKey, ChainTypes} from 'peerplaysjs-lib';
import AccountRepository from '../repositories/AccountRepository';
import accountUtils from '../common/account_utils';
import WalletApi from '../rpc_api/WalletApi';
import ActionTypes from '../constants/ActionTypes';
import Config from '../../config/Config';

const [
  VOTING_SET_DATA,
  VOTING_CHANGE_PROXY,
  VOTING_SET_NEW_WITNESSES,
  VOTING_UPDATE_WITNESS_TAB,
  VOTING_TOGGLE_HAS_VOTED,
  VOTING_SET_WITNESS_COUNT,
  VOTING_SET_COMMITTEE_COUNT,
  VOTING_RESET_VOTED_COUNTS
] = [
  ActionTypes.VOTING_SET_DATA,
  ActionTypes.VOTING_CHANGE_PROXY,
  ActionTypes.VOTING_SET_NEW_WITNESSES,
  ActionTypes.VOTING_UPDATE_WITNESS_TAB,
  ActionTypes.VOTING_TOGGLE_HAS_VOTED,
  ActionTypes.VOTING_SET_WITNESS_COUNT,
  ActionTypes.VOTING_SET_COMMITTEE_COUNT,
  ActionTypes.VOTING_RESET_VOTED_COUNTS
];

let witness_object_type  = parseInt(ChainTypes.object_type.witness, 10);
let witnessPrefix = '1.' + witness_object_type + '.';
let lastBudgetObject = null;

const DEFAULT_PROXY_ID = '1.2.5';
const walletApi = new WalletApi();

class VotingPrivateActions {
  static fetchDataAction(data) {
    return {
      type: VOTING_SET_DATA,
      payload: data
    };
  }

  /**
   * Private Redux Action Creator (VOTING_CHANGE_PROXY)
   * Change proxy
   *
   * @param {{name, id}} data - change proxy object
   * @returns {{type: VOTING_CHANGE_PROXY, payload: {name, id}}}
   */
  static changeProxyAction(data) {
    return {
      type: VOTING_CHANGE_PROXY,
      payload: data
    };
  }

  /**
   *
   * @param {boolean} val - enable/disable finish button on the voting container sub-components
   */
  static toggleHasVoted(val) {
    return {
      type: VOTING_TOGGLE_HAS_VOTED,
      payload: {val}
    };
  }

  /**
   * Used between block generations for the very speedy users to ensure correct data exists between states and block generation.
   *
   * @static
   * @param {number} num
   * @returns
   * @memberof VotingPrivateActions
   */
  static setVotedWitnessCount(num) {
    return {
      type: VOTING_SET_WITNESS_COUNT,
      payload: {num}
    };
  }

  /**
   * Used between block generations for the very speedy users to ensure correct data exists between states and block generation.
   *
   * @static
   * @param {number} num
   * @returns
   * @memberof VotingPrivateActions
   */
  static setVotedCommitteeCount(num) {
    return {
      type: VOTING_SET_COMMITTEE_COUNT,
      payload: {num}
    };
  }

  /**
   * Return the counts to what they were before a failed broadcasted transaction occurred.
   *
   * @static
   * @returns
   * @memberof VotingPrivateActions
   */
  static resetVotedCounts() {
    return {
      type: VOTING_RESET_VOTED_COUNTS
    };
  }
}

class VotingActions {
  /**
 * Get all the data for the voting page
 * fetchData/
 *      getProxyData - Proxy Page
 *      getWitnessData - Witness Page
 *      getCMData - Committee Page
 *      getProposalsData - Proposals page - TODO::remove
 *
 * @returns {function(*=, *)}
 */
  static fetchData() {
    return (dispatch, getState) => {
      const accountName = getState().app.account;
      return VotingActions.getProxyData(accountName).then((proxy) => {
        const newWitnesses = getState().voting.newWitnesses;

        return VotingActions.getWitnessData(accountName, newWitnesses).then((witnesses) => {
          return VotingActions.getCMData(accountName).then((committeeMembers) => {
            return VotingActions.getProposalsData(accountName).then((proposals) => {
              dispatch(VotingPrivateActions.fetchDataAction({
                proxy,
                witnesses,
                committeeMembers,
                proposals
              }));
            });
          });
        });
      });
    };
  }

  /**
 * Update only a witness page
 * @returns {function(*, *)}
 */
  static fetchWitnessData() {
    return (dispatch, getState) => {
      const accountName = getState().app.account,
        newWitnesses = getState().voting.newWitnesses;

      return VotingActions.getWitnessData(accountName, newWitnesses).then((witnesses) => {
        dispatch({
          type: VOTING_UPDATE_WITNESS_TAB,
          payload: {witnesses}
        });
      });
    };
  }

  /**
  * fetchData/getProxyData
  *
  * @param {String} accountName
  */
  static getProxyData(accountName) {
    return Repository.fetchFullAccount(accountName).then((result) => {
      const account = result.toJS();
      const proxyId = account.options.voting_account;

      return Repository.getAccount(proxyId).then((result) => {
        const proxy = result.toJS();
        return {
          name: proxyId !== DEFAULT_PROXY_ID ? proxy.name : '',
          id: proxyId
        };
      });
    });
  }

  /**
   * Change proxy
   * @param data
   * @returns {function(*): *}
   */
  static changeProxy(data) {
    return (dispatch) => dispatch(VotingPrivateActions.changeProxyAction(data));
  }

  /**
   *
   *
   * @param {String} proxyId
   * @returns {function(*, *)}
   */
  static publishProxy(proxyId) {
    return (dispatch, getState) => {
      return Repository.getAccount(getState().app.account).then((result) => {
        const account = result.toJS();
        account.account = account.id;
        account.new_options = account.options;
        account.new_options.voting_account = proxyId ? proxyId : DEFAULT_PROXY_ID;
        account.fee = {
          amount: 0,
          asset_id: accountUtils.getFinalFeeAsset(account.id, 'account_update')
        };
        account.extensions = {value: {update_last_voting_time: true}};

        const tr = walletApi.new_transaction();
        tr.add_type_operation('account_update', account);
        return tr;
      });
    };
  }

  /**
   * fetchData/getWitnessData
   *
   * @param {string} accountName
   */
  static getWitnessData(accountName, newWitnesses) {
    return Promise.all([
      Repository.getAccount(accountName),
      Repository.getObject('2.0.0'),
      Repository.getObject('2.1.0'),
      Repository.getObject('1.3.0'),
      Repository.getWitnesses()
    ]).then((results) => {
      const account = results[0].toJS();
      let votes = account.options.votes;
      const proxyId = account.options.voting_account;
      const object200 = results[1].toJS();
      const object210 = results[2].toJS();
      const coreAsset = results[3].toJS();
      const witnesses = results[4].toJS();

      return Promise.all([Repository.getObject(object210.current_witness), (votes && votes.length)
        ? Repository.getObjectsByVoteIds(votes)
        : []]).then((results) => {

        const result = results[0];
        const votesArray = results[1];
        const currentWitness = result.toJS();

        return Repository.getAccount(currentWitness.witness_account).then((result) => {
          const currentWitnessAccount = result.toJS();
          const list = [];
          const approvedAccounts = {};
          const objectAccounts = {};
          let allWitnesses = [];

          allWitnesses = allWitnesses.concat(Config.ACTIVE_WITNESS_ONLY
            ? object200.active_witnesses
            : witnesses
          );
          votesArray.forEach((vote) => {
            if (allWitnesses.indexOf(vote.get('id')) === -1) {
              allWitnesses.push(vote.get('id'));
            }
          });

          newWitnesses.forEach((wId) => {
            if (allWitnesses.indexOf(wId) === -1) {
              allWitnesses.push(wId);
            }
          });

          allWitnesses = allWitnesses.filter((witnessId) => {
            return (witnessId && witnessId.indexOf(witnessPrefix) !== -1);
          });

          const promises = allWitnesses.map((witnessId) => {
            return Repository.getObject(witnessId).then((result) => {
              if (!result) {
                return false;
              }

              const witness = result.toJS();

              if (!witness.witness_account) {
                return false;
              }

              list.push(witness);

              return Repository.getObject(witness.witness_account).then((result) => {
                if (!result) {
                  return null;
                }

                const witnessAccount = result.toJS();
                objectAccounts[witness.witness_account] = witnessAccount;
                votes = votes.filter((item) => {
                  if (item === witness.vote_id) {
                    approvedAccounts[witness.witness_account] = witness.witness_account;
                    return false;
                  } else {
                    return true;
                  }
                });
              });
            });
          });

          return Promise.all(promises).then(() => {
            return {
              currentWitnessAccount,
              currentWitnessId: object210.current_witness,
              activeWitnesseIds: allWitnesses,
              allWitnesses: allWitnesses,
              cmVotes: votes,
              activeWitnesseObjects: Immutable.List(list),
              approvedWitnesseIds: Immutable.Map(approvedAccounts),
              activeWitnesseAccounts: Immutable.Map(objectAccounts),
              witnessAmount: object200.active_witnesses.length,
              participation: object210.participation,
              witnessPayPerBlock: object200.parameters.witness_pay_per_block,
              asset: coreAsset,
              witnessBudget: object210.witness_budget,
              nextMaintenanceTime: object210.next_maintenance_time,
              currentAslot: object210.current_aslot,
              blockInterval: object200.parameters.block_interval,
              proxyIsEnabled: proxyId !== DEFAULT_PROXY_ID
            };
          });
        });
      });
    });
  }

  /**
 *
 * Added unknown witness
 * @param {string} id - Witness Id
 * @returns {function(*, *)}
 */
  static addNewWitnessData(id) {
    return (dispatch, getState) => {
      const state = getState();
      const newWitnesses = state.voting.newWitnesses;

      newWitnesses.push(id);

      dispatch({
        payload: {
          newWitnesses: newWitnesses
        },
        type: VOTING_SET_NEW_WITNESSES
      });
    };
  }

  /**
   * Publish changed data on the page of the Voting/Witness page
   * @param witnesses
   * @returns {function(*, *)}
   */
  static publishWitnesses(witnesses) {
    return (dispatch, getState) => {
      return Repository.getAccount(getState().app.account).then((result) => {
        const account = result.toJS();
        account.account = account.id;
        account.new_options = account.options;
        account.new_options.num_witness = witnesses.size;
        account.new_options.num_committee = getState().voting.numVotedCommitteeMembers;
        account.fee = {
          amount: 0,
          asset_id: accountUtils.getFinalFeeAsset(account.id, 'account_update')
        };
        account.extensions = {value: {update_last_voting_time: true}};

        const voteIds = getState().voting.witnesses.activeWitnesseObjects
          .filter((obj) => witnesses.has(obj.witness_account)).map((obj) => obj.vote_id).toArray();
        account.new_options.votes = getState().voting.witnesses.cmVotes.concat(voteIds)
          .sort((a, b) => {
            const aSplit = a.split(':');
            const bSplit = b.split(':');

            return parseInt(aSplit[1], 10) - parseInt(bSplit[1], 10);
          });
        const tr = walletApi.new_transaction();
        tr.add_type_operation('account_update', account);
        return tr;
      });
    };
  }

  /**
   * Get data of the Voting/Committee page
   * fetchData/getCMData
   *
   * @param {string} accountName
   */
  static getCMData(accountName) {
    return Promise.all([
      Repository.getAccount(accountName),
      Repository.getObject('2.0.0'),
      Repository.getObject('2.1.0'),
      Repository.getObject('1.3.0')
    ]).then((results) => {
      const account = results[0].toJS();
      let votes = account.options.votes;
      const proxyId = account.options.voting_account;
      const object200 = results[1].toJS();
      const coreAsset = results[3].toJS();
      const list = [];
      const approvedAccounts = {};
      const objectAccounts = {};
      const promises = object200.active_committee_members.map((cmId) => {
        return Repository.getObject(cmId).then((result) => {
          if (!result) {
            return false;
          }

          const committeeMember = result.toJS();
          list.push(committeeMember);

          Repository.getObject(committeeMember.committee_member_account).then((result) => {
            let cmAccount;

            if (result) {
              cmAccount = result.toJS();
            }

            objectAccounts[committeeMember.committee_member_account] = cmAccount;

            votes = votes.filter((item) => {
              if (item === committeeMember.vote_id) {
                approvedAccounts[committeeMember.committee_member_account] = committeeMember
                  .committee_member_account;
                return false;
              } else {
                return true;
              }
            });
          });
        });
      });

      return Promise.all(promises).then(() => {
        return {
          activeCM: object200.active_committee_members,
          activeCMObjects: Immutable.List(list),
          witnessesVotes: votes,
          asset: coreAsset,
          approvedCMIds: Immutable.Map(approvedAccounts),
          activeCMAccounts: Immutable.Map(objectAccounts),
          cmAmount: object200.active_committee_members.length,
          proxyIsEnabled: proxyId !== DEFAULT_PROXY_ID
        };
      });
    });
  }

  /**
   * Publish changed data on the page of the Committees
   *
   * @param {Immutable.Map} committeeMembers
   * @returns {function(*, *)}
   */
  static publishCM(committeeMembers) {
    return (dispatch, getState) => {
      return Repository.getAccount(getState().app.account).then((result) => {
        const account = result.toJS();
        account.account = account.id;
        account.new_options = account.options;
        account.new_options.num_committee = committeeMembers.size;
        account.new_options.num_witness = getState().voting.numVotedWitnesses;
        account.fee = {
          amount: 0,
          asset_id: accountUtils.getFinalFeeAsset(account.id, 'account_update')
        };
        account.extensions = {value: {update_last_voting_time: true}};

        const voteIds = getState().voting.committeeMembers.activeCMObjects
          .filter((obj) => committeeMembers.has(obj.committee_member_account))
          .map((obj) => obj.vote_id).toArray();
        account.new_options.votes = getState().voting.committeeMembers.witnessesVotes
          .concat(voteIds).sort((a, b) => {
            const aSplit = a.split(':');
            const bSplit = b.split(':');

            return parseInt(aSplit[1], 10) - parseInt(bSplit[1], 10);
          });
        const tr = walletApi.new_transaction();
        tr.add_type_operation('account_update', account);
        return tr;
      });
    };
  }


  /**
   * TODO::rm
   * Get data of the Voting/Proposal page
   * fetchData/getProposalsData
   *
   * @param {string} accountName
   */
  static getProposalsData(accountName) {
    const workerPromises = [];

    for (let i = 0; i < 100; i++) {
      const id = `1.14.${i}`;
      workerPromises.push(Repository.getObject(id).then((w) => w).catch((e) => e));
    }

    return Promise.all(workerPromises).then((result) => {
      result = result.filter((w) => {
        if (!w) {
          return false;
        }

        const now = new Date();

        return (
          new Date(w.get('work_end_date')) > now && new Date(w.get('work_begin_date')) <= now
        );
      }).map((w) => w.toJS()).sort((a, b) => {
        /* eslint-disable-next-line */
        return getTotalVotes(b) - getTotalVotes(a); // TODO: find/make/ref these functions
      });

      return Promise.all([
        Promise.resolve(result),
        Repository.getObject('2.0.0'),
        Repository.getAccount(accountName),
        Repository.getObject('1.3.0'),
        Repository.getObject(lastBudgetObject ? lastBudgetObject : '2.13.1').catch((err) => err)
      ]).then((results) => {
        const workers = results[0];
        const globalObject = results[1].toJS();
        const account = results[2].toJS();
        const coreAsset = results[3].toJS();
        const coreSymbol = asset_utils.getSymbol(coreAsset.symbol);
        const precision = Math.pow(10, coreAsset.precision);
        const votes = Immutable.Set(account.options.votes);
        let budgetObject = results[4];

        if (budgetObject) {
          const timestamp = budgetObject.get('time');
          const now = new Date();
          const idIndex = parseInt(budgetObject.get('id').split('.')[2], 10);
          const currentID = idIndex + Math.floor((now - new Date(timestamp + '+00:00')
            .getTime()) / 1000 / 60 / 60) - 1;
          const newID = `2.13.${Math.max(idIndex, currentID)}`;

          ChainStore.getObject(newID);
          lastBudgetObject = newID;
        } else {
          if (lastBudgetObject && lastBudgetObject !== '2.13.1') {
            const newBudgetObjectId = parseInt(lastBudgetObject.split('.')[2], 10) - 1;
            lastBudgetObject = `2.13.${(newBudgetObjectId - 1)}`;
          }
        }

        if (lastBudgetObject) {
          budgetObject = ChainStore.getObject(lastBudgetObject);
        }

        let totalBudget = 0;
        let unusedBudget = 0;
        let workerBudget = globalObject ? globalObject.parameters.worker_budget_per_day : 0;

        if (budgetObject) {
          workerBudget = Math.min(24 * budgetObject
            .getIn(['record', 'worker_budget']), workerBudget);
          totalBudget = Math.min(24 * budgetObject
            .getIn(['record', 'worker_budget']), workerBudget);
        }

        const dataPromises = workers.map((worker, index) => { // eslint-disable-line
          let dailyPay = parseInt(worker.daily_pay, 10);
          workerBudget = workerBudget - dailyPay;
          const rest = workerBudget + dailyPay;
          const totalVotes = (worker.total_votes_for - worker.total_votes_against) / precision;
          const approvalState = votes.has(worker.vote_for)
            ? true
            : votes.has(worker.vote_against)
              ? false
              :null;
          let approval = counterpart.translate('account.votes.status.neutral');

          if (approvalState === true) {
            approval = counterpart.translate('account.votes.status.supported');
          } else if (approvalState === false) {
            approval = counterpart.translate('account.votes.status.rejected');
          }

          let displayURL = worker.url ? worker.url.replace(/http:\/\/|https:\/\//, '') : '';

          if (displayURL.length > 25) {
            displayURL = `${displayURL.substr(0, 25)}...`;
          }

          let fundedPercent = 0;

          if (worker.daily_pay < rest) {
            fundedPercent = 100;
          } else if (rest > 0) {
            fundedPercent = rest / worker.daily_pay * 100;
          }

          const startDate = counterpart.localize(new Date(worker.work_begin_date), {type: 'date'});
          const endDate = counterpart.localize(new Date(worker.work_end_date), {type: 'date'});
          const now = new Date();
          const isExpired = new Date(worker.work_end_date) <= now;

          return Promise.all([
            Repository.getAccount(worker.worker_account),
            worker.worker[1].balance
              ? Repository.getObject(worker.worker[1].balance)
              : Promise.resolve(null),
            worker.worker[1].total_burned
              ? Promise.resolve(worker.worker[1].total_burned)
              : Promise.resolve(null)
          ]).then((arr) => {
            const creator = arr[0].toJS();

            const unclaimedPay = arr[1] ? arr[1].toJS().balance.amount / precision : null;
            const recycled = arr[2] ? arr[2] / precision : null;
            dailyPay = dailyPay / precision;
            return {
              id: worker.id,
              vote_against: worker.vote_against,
              vote_for: worker.vote_for,
              name: worker.name,
              startDate,
              endDate,
              creator: creator.name,
              url: worker.url,
              displayURL,
              netVotes: totalVotes,
              dailyPay,
              unclaimedPay,
              recycled,
              fundedPercent,
              approval,
              isExpired,
              assetSymbol: coreSymbol
            };
          });
        });
        return Promise.all(dataPromises).then((data) => {
          unusedBudget = Math.max(0, workerBudget);

          return {
            list: data,
            budget: {
              total: totalBudget / precision,
              unused: unusedBudget / precision,
              assetSymbol: coreSymbol
            },
            votes
          };
        });
      });
    }).catch((err) => console.log(err));
  }

  /**
   *
   * @param votes
   * @returns {function(*, *)}
   */
  static publishProposals(votes) {
    return (dispatch, getState) => {
      return Repository.getAccount(getState().app.account).then((result) => {
        const account = result.toJS();
        account.account = account.id;
        account.new_options = account.options;
        let voteIds = votes;
        const workers = getState().voting.proposals.list;
        const now = new Date();

        function removeVote(list, vote) {
          if (list.includes(vote)) {
            list = list.delete(vote);
          }

          return list;
        }

        workers.forEach((worker) => {
          if (worker) {
            if (new Date(worker.endDate) <= now) {
              voteIds = removeVote(voteIds, worker.vote_for);
            }

            // TEMP Remove vote_against since they're no longer used
            voteIds = removeVote(voteIds, worker.vote_against);
          }
        });

        account.new_options.votes = voteIds.toArray()
          .sort((a, b) => {
            const aSplit = a.split(':');
            const bSplit = b.split(':');

            return parseInt(aSplit[1], 10) - parseInt(bSplit[1], 10);
          });

        const tr = walletApi.new_transaction();
        tr.add_type_operation('account_update', account);
        return tr;
      });
    };
  }

  static holdTransaction(tr) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const aesPrivate = getState().walletData.aesPrivate,
          keys = getState().privateKey.keys,
          processKey = keys.get('owner') ? keys.get('owner') : keys.get('active');
        const privateKeyBuffer = aesPrivate.decryptHexToBuffer(processKey.encrypted_key);
        const key = PrivateKey.fromBuffer(privateKeyBuffer);

        AccountRepository.process_transaction(tr, key).then(() => resolve())
          .catch((err) => {
            console.log((new Date()).toDateString(), 'Error: ', err);
            // Reset the state.voting.numVotedWitnesses & state.voting.numVotedCommitteeMembers to what they were prior to the transaction publish attempt.
            VotingActions.resetVotedCounts();
            reject(err);
          });
      });
    };
  }

  static toggleHasVoted(val) {
    return (dispatch) => {
      dispatch(VotingPrivateActions.toggleHasVoted(val));
    };
  }

  static setVotedCommitteeCount(num) {
    return (dispatch, getState) => {
      // Refer to old values to ensure the update is needed
      const oldVotedCommitteeCount = getState().voting.numVotedCommitteeMembers;

      if (num !== oldVotedCommitteeCount) {
        dispatch(VotingPrivateActions.setVotedCommitteeCount(num));
      }
    };
  }

  static setVotedWitnessCount(num) {
    return (dispatch, getState) => {
      // Refer to old values to ensure the update is needed
      const oldVotedWitnessCount = getState().voting.numVotedWitnesses;

      if (num !== oldVotedWitnessCount) {
        dispatch(VotingPrivateActions.setVotedWitnessCount(num));
      }
    };
  }

  static resetVotedCounts() {
    return (dispatch) => {
      dispatch(VotingPrivateActions.resetVotedCounts());
    };
  }
}

export default VotingActions;
