import ActionTypes from '../constants/ActionTypes';
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


/**
 *
 * Voting Reducer is used to controlling tabs on the Voting page
 *
 * Initial State
 *
 * proxy - Voting/Proxy page data
 * witnesses - Voting/Witnesses page data
 * committeeMembers - Voting/Committee Members page(Advisors) data
 * proposals - Voting/Proposal page data
 */
const initialState = {
  proxy: {
    knownProxies: []
  },
  // Voting/witnesses page
  witnesses: {
    sortBy: 'rank',
    inverseSort: true
  },
  // New witness ids
  newWitnesses: [],
  // Voting/Committee Members page(Advisors)
  committeeMembers: {},
  // Proposal page TODO::rm
  proposals: {},
  hasVoted: false,
  numVotedWitnesses: 0,
  numVotedCommitteeMembers: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    /**
     * Voting Page
     * Set Voting page data(Pages: proxy, witnesses, committeeMembers, proposals)
     */
    case VOTING_SET_DATA:
      return Object.assign({}, state, {
        proxy: action.payload.proxy,
        witnesses: action.payload.witnesses,
        numVotedWitnesses: action.payload.committeeMembers.witnessesVotes.length,
        committeeMembers: action.payload.committeeMembers,
        numVotedCommitteeMembers: action.payload.witnesses.cmVotes.length,
        proposals: action.payload.proposals //TODO::rm
      });
      /**
       * Proxy page
       * Change account proxy
       */
    case VOTING_CHANGE_PROXY:
      return Object.assign({}, state, {
        proxy: {
          ...state.proxy,
          name: action.payload.name,
          id: action.payload.id
        }
      });
      // Add new witness
    case VOTING_SET_NEW_WITNESSES:
      return Object.assign({}, state, {
        ...state,
        newWitnesses: action.payload.newWitnesses
      });
      // Update only a witness page
    case VOTING_UPDATE_WITNESS_TAB:
      return Object.assign({}, state, {
        ...state,
        witnesses: action.payload.witnesses,
        numVotedWitnesses: action.payload.witnesses.size
      });
    case VOTING_TOGGLE_HAS_VOTED:
      // Only needs to be toggled once to allow for multiple voting to occur and allow clicking the "Finish" button.
      return Object.assign({}, state, {
        ...state.hasVoted,
        hasVoted: action.payload.val
      });
    case VOTING_SET_WITNESS_COUNT:
      return Object.assign({}, state, {
        ...state.numWitnesses,
        numVotedWitnesses: action.payload.num
      });
    case VOTING_SET_COMMITTEE_COUNT:
      return Object.assign({}, state, {
        ...state.numCommitteeMembers,
        numVotedCommitteeMembers: action.payload.num
      });
    case VOTING_RESET_VOTED_COUNTS:
      return Object.assign({}, state, {
        ...state,
        numVotedWitnesses: state.voting.committeeMembers.witnessesVotes.length,
        numVotedCommitteeMembers: state.voting.witnesses.cmVotes.length
      });
    default:
      // We return the previous state in the default case
      return state;
  }
};