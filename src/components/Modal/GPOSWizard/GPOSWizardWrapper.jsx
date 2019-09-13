import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {GPOSActions} from '../../../actions';
// import Translate from 'react-translate-component';
import Modal from 'react-modal';
import {getTotalGposBalance} from '../../../selectors/GPOSSelector';
import Start from './Start';

Modal.setAppElement('#content');

class GPOSWizardWrapper extends Component {
  state = {
    currentStep: 1 // default, start page
  }

  closeModal = () => {
    this.props.toggleGPOSWizard();
  }

  render() {
    let {totalGpos} = this.props;
    // let disablePowerDown = totalGpos && totalGpos > 0 ? false : true;

    // // Override as we do not have gpos withdrawal functionality
    // disablePowerDown = true;

    return (
      <div className='gposModal'>
        <Modal
          isOpen={ this.props.showGPOSWizardModal }
          contentLabel='onRequestClose Example'
          onRequestClose={ this.handleCloseModal }
          overlayClassName='gpos-modal__bg'
          className='gpos-modal'
        >
          {
            <Start totalGpos={ totalGpos } closeModal={ this.closeModal }/>
          }
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let data = getTotalGposBalance(state);

  return {
    showGPOSWizardModal: state.gposReducer.showGPOSWizardModal,
    totalGpos: data.totalAmount
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleGPOSWizard: GPOSActions.toggleGPOSWizardModal
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(GPOSWizardWrapper);