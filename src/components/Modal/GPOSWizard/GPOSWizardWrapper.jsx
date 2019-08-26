import React, {Component} from 'react';
// import Translate from 'react-translate-component';
import {Modal, ModalBody} from 'react-modal-bootstrap';
import {bindActionCreators} from 'redux';
import {GPOSActions} from '../../../actions';

class GPOSWizardWrapper extends Component {
  state = {
    currentStep: 1 // default, start page
  }
  render() {
    return (
      <Modal
        isOpen={ this.props.showGPOSWizardModal }
        autoFocus={ true }
        backdropStyles={ {
          base: {
            background: 'rgba(255, 255, 255, .5)',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.4s',
            overflowX: 'hidden',
            overflowY: 'auto'
          },
          open: {
            opacity: 1,
            visibility: 'visible'
          }
        } }>
        <ModalBody>
            Some content here

            TODO: Switch to different steps via local state
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    showGPOSWizardModal: state.gposReducer.showGPOSWizardModal
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleGPOSWizard: GPOSActions.toggleGPOSWizardModal
  },
  dispatch
);

export default(mapStateToProps, mapDispatchToProps)(GPOSWizardWrapper);