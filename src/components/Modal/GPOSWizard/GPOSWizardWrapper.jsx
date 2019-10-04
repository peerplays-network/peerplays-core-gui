import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {GPOSActions} from '../../../actions';
import Modal from 'react-modal';
import {getTotalGposBalance} from '../../../selectors/GPOSSelector';
import Start from './Start';
import Step1 from './Step1';
import Vote from './Vote';
import Done from './Done';

Modal.setAppElement('#content');

// TODO: refactor names of GPOSWizard to GPOSModal
// TODO: renove references of "step(s)" as this is no longer a "steps" wizard.

class GPOSWizardWrapper extends Component {
  /*
    0 - start
    1.1 - power up
    1.2 - power down
    2 - vote
    3 - done
  */
  state = {
    currentStep: 0,
    completedStages: {1.1: false, 1.2: false, 2: false}
  }

  closeModal = () => {
    this.props.toggleGPOSWizard();
  }

  proceedOrRegress = (step, stageCompleted = undefined) => {
    this.setState({currentStep: step});

    if (stageCompleted !== undefined) {
      let newCompletedStages = this.state.completedStages;
      newCompletedStages[stageCompleted] = true;

      console.log(newCompletedStages);
      this.setState({completedStages: newCompletedStages});
    }
  }

  renderStepContent = (totalGpos) => {
    let current = this.state.currentStep;

    switch (current) {
      case 0: return <Start totalGpos={ totalGpos } closeModal={ this.closeModal } proceedOrRegress={ this.proceedOrRegress } completedStages={ this.state.completedStages }/>;
      case 1.1: return <Step1 totalGpos={ totalGpos } proceedOrRegress={ this.proceedOrRegress } action={ 1.1 }/>;
      case 1.2: return <Step1 totalGpos={ totalGpos } proceedOrRegress={ this.proceedOrRegress } action={ 1.2 }/>;
      case 2: return <Vote finishHandler={ this.proceedOrRegress } cancelHandler={ this.proceedOrRegress }/>;
      case 3: return <Done okHandler={ this.proceedOrRegress }/>;
      //no default
    }
  }

  render() {
    let {totalGpos} = this.props;
    let content = this.renderStepContent(totalGpos);
    let dialogueClass = `gpos-modal${'-' + this.state.currentStep.toString().replace('.', '-')}`;

    return (
      <div>
        <Modal
          isOpen={ this.props.showGPOSWizardModal }
          contentLabel='onRequestClose Example'
          onRequestClose={ this.handleCloseModal }
          overlayClassName='gpos-modal__bg'
          className={ dialogueClass }
        >
          {
            content
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