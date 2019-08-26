import ActionTypes from '../constants/ActionTypes';

class GPOSPrivateActions {
  static toggleGPOSModal(isShow) {
    return {
      type: ActionTypes.TOGGLE_GPOS_WIZARD,
      payload: {
        showGPOSWizardModal: isShow
      }
    };
  }
}

class GPOSActions {
  static toggleGPOSWizardModal(showGPOSWizardModal) {
    return (dispatch) => {
      dispatch(GPOSPrivateActions.toggleGPOSModal(showGPOSWizardModal));
    };
  }
}

export default GPOSActions;