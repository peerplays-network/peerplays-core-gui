import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {GPOSActions} from '../../../actions';
import Translate from 'react-translate-component';
import Modal from 'react-modal';
import {getTotalGposBalance} from '../../../selectors/GPOSSelector';

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
    let disablePowerDown = totalGpos && totalGpos > 0 ? false : true;

    // Override as we do not have gpos withdrawal functionality
    disablePowerDown = true;

    return (
      <div className='gposModal'>
        <Modal
          isOpen={ this.props.showGPOSWizardModal }
          contentLabel='onRequestClose Example'
          onRequestClose={ this.handleCloseModal }
          overlayClassName='gpos-modal__bg'
          className='gpos-modal'
        >
          <div className='gpos-modal__content'>
            <div className='gpos-modal__content-left'>
              <div className='gpos-modal__wizard-desc'>
                <Translate
                  component='div'
                  className='title'
                  content='gpos.wizard.start.desc.title'
                />
                <Translate
                  component='p'
                  className='txt--bold'
                  content='gpos.wizard.start.desc.txt-1'
                />
                <Translate
                  component='p'
                  className='txt--bold'
                  content='gpos.wizard.start.desc.txt-2'
                />
                <Translate
                  component='p'
                  className='txt'
                  content='gpos.wizard.start.desc.txt-3'
                />
                <Translate
                  component='p'
                  className='txt'
                  content='gpos.wizard.start.desc.txt-4'
                />
                <Translate
                  component='p'
                  className='txt--indent txt--bold'
                  content='gpos.wizard.start.desc.txt-5'
                />
                <Translate
                  component='p'
                  className='txt--indent txt--bold'
                  content='gpos.wizard.start.desc.txt-6'
                />
                <Translate
                  component='p'
                  className='txt--margin-top line'
                  content='gpos.wizard.start.desc.txt-7'
                />
              </div>
            </div>
            <div className='gpos-modal__content-right'>
              <div className='gpos-modal__step'>
                <img className='gpos-modal__step-1' src='images/gpos/step1.png' alt='step1'/>
                <Translate
                  component='p'
                  className='gpos-modal__step-txt'
                  content='gpos.wizard.start.right.1'
                />
              </div>
              <div className='gpos-modal__step'>
                <img className='gpos-modal__step-2' src='images/gpos/step2.png' alt='step2'/>
                <Translate
                  component='p'
                  className='gpos-modal__step-txt'
                  content='gpos.wizard.start.right.2'
                />
              </div>
              <div className='gpos-modal__step'>
                <img className='gpos-modal__step-3' src='images/gpos/step3.png' alt='step3'/>
                <Translate
                  component='p'
                  className='gpos-modal__step-txt'
                  content='gpos.wizard.start.right.3'
                />
              </div>
              <div className='gpos-modal__btns'>
                <button className='gpos-modal__btn-cancel' onClick={ this.closeModal }>
                  <Translate className='gpos-modal__btn-txt' content='gpos.wizard.cancel'/>
                </button>
                <button className='gpos-modal__btn-up'>
                  <Translate className='gpos-modal__btn-txt' content='gpos.wizard.up'/>
                </button>
                <button className='gpos-modal__btn-down' disabled={ disablePowerDown }>
                  <Translate className='gpos-modal__btn-txt' content='gpos.wizard.down'/>
                </button>
              </div>
            </div>
          </div>
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