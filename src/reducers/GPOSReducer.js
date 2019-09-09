import ActionTypes from '../constants/ActionTypes';

/**
 * GPOS Reducer is use to control the GPOS Wizard modal.
 *
 * Initial State
 *
 * showGPOSWizardModal - Show|hide GPOS Wizard modal.
 */
const initialState = {
  showGPOSWizardModal: false
};

export default (state = initialState, action) => {
  switch(action.type) {
    // Toggle GPOS Wizard modal
    case ActionTypes.TOGGLE_GPOS_WIZARD:
      return {
        ...state,
        showGPOSWizardModal: ActionTypes.payload.showGPOSWizardModal
      };
    default:
      // We return the previous state in the default case
      return state;
  }
};