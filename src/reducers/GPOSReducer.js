import ActionTypes from '../constants/ActionTypes';

/**
 * GPOS Reducer is use to control the GPOS Wizard modal.
 *
 * Initial State
 *
 * showGPOSWizardModal - Show|hide GPOS Wizard modal.
 */
const initialState = {
  showGPOSWizardModal: false,
  completedStages: {1.1: false, 1.2: false, 2: false}
};

export default (state = initialState, action) => {
  switch(action.type) {
    // Toggle GPOS Wizard modal
    case ActionTypes.TOGGLE_GPOS_WIZARD:
      return {
        ...state,
        showGPOSWizardModal: action.payload.showGPOSWizardModal
      };
    case ActionTypes.SET_GPOS_STAGES:
      return {
        ...state,
        completedStages: action.payload.completedStages
      };
    case ActionTypes.RESET_GPOS:
      return {
        showGPOSWizardModal: action.payload.showGPOSWizardModal,
        completedStages: action.payload.completedStages
      };
    default:
      // We return the previous state in the default case
      return state;
  }
};