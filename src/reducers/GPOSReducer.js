import ActionTypes from '../constants/ActionTypes';

/**
 * GPOS Reducer is use to control the GPOS modal.
 *
 * Initial State
 *
 * showGPOSModal - Show|hide GPOS modal.
 */
const initialState = {
  showGPOSModal: false,
  completedStages: {1.1: false, 1.2: false, 2: false}
};

export default (state = initialState, action) => {
  switch(action.type) {
    // Toggle GPOS modal
    case ActionTypes.TOGGLE_GPOS_MODAL:
      return {
        ...state,
        showGPOSModal: action.payload.showGPOSModal
      };
    case ActionTypes.SET_GPOS_STAGES:
      return {
        ...state,
        completedStages: action.payload.completedStages
      };
    case ActionTypes.RESET_GPOS:
      return {
        showGPOSModal: action.payload.showGPOSModal,
        completedStages: action.payload.completedStages
      };
    default:
      // We return the previous state in the default case
      return state;
  }
};