import ActionTypes from '../constants/ActionTypes';
import AppUtils from '../utility/AppUtils';
import {anchors} from '../components/Help/HelpModal';

class HelpPrivateActions {
  /**
   * Private Action Creator (TOGGLE_HELP_POPUP)
   *
   * @param isShow
   * @returns {{type, payload: {showHelpModal: boolean}}}
   */
  static toggleModalAction(isShow) {
    return {
      type: ActionTypes.TOGGLE_HELP_POPUP,
      payload: {
        showHelpModal: isShow
      }
    };
  }
}

class HelpActions {
  /**
 * Toggle Help popup
 *
 * @param {boolean} showHelpModal
 * @returns {function(*=, *)}
 */
  static toggleHelpModal(showHelpModal) {
    return (dispatch) => {
      dispatch(HelpPrivateActions.toggleModalAction(showHelpModal));
    };
  }

  /**
   * Open the FAQ Help modal and scroll to the header target.
   *
   * @static
   * @param {boolean} showHelpModal
   * @param {string} target - ie: "FAQ_GPOS"
   * @returns
   * @memberof HelpActions
   */
  static toggleHelpAndScroll(showHelpModal, target) {
    return (dispatch) => {
      dispatch(HelpPrivateActions.toggleModalAction(showHelpModal));
      AppUtils.scrollToOtherRef(target, anchors.MODAL);
    };
  }
}

export default HelpActions;