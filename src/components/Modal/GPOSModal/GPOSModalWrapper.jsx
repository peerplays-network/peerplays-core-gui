import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {GPOSActions} from '../../../actions';
import Modal from 'react-modal';
import {getGposTotal, getAvailableGpos} from '../../../selectors/GPOSSelector';
import Start from './Start';
import DepositWithdraw from './DepositWithdraw';
import Vote from './Vote';
import Done from './Done';

Modal.setAppElement('#content');

class GPOSModalWrapper extends Component {
  /*
    0 - start
    1.1 - power up
    1.2 - power down
    2 - vote
    3 - done
  */
  state = {
    currentStage: 0
  }

  closeModal = () => {
    this.props.toggleGPOSModal();
  }

  proceedOrRegress = (stage, stageCompleted = undefined) => {
    this.setState({currentStage: stage});

    if (stageCompleted !== undefined) {
      this.props.setCompletedStages(stageCompleted);
    }
  }

  renderStageContent = (totalGpos, availableGPOS) => {
    let current = this.state.currentStage;
    let completedStages = this.props.completedStages;

    switch (current) {
      case 0: return <Start totalGpos={ totalGpos } closeModal={ this.closeModal } proceedOrRegress={ this.proceedOrRegress } completedStages={ completedStages }/>;
      case 1.1: return <DepositWithdraw totalGpos={ totalGpos } availableGpos={ availableGPOS } proceedOrRegress={ this.proceedOrRegress } action={ 1.1 }/>;
      case 1.2: return <DepositWithdraw totalGpos={ totalGpos } availableGpos={ availableGPOS } proceedOrRegress={ this.proceedOrRegress } action={ 1.2 }/>;
      case 2: return <Vote proceedOrRegress={ this.proceedOrRegress }/>;
      case 3: return <Done okHandler={ this.proceedOrRegress }/>;
      //no default
    }
  }

  render() {
    let {totalGpos, availableGpos} = this.props;
    let content = this.renderStageContent(totalGpos, availableGpos);
    let dialogueClass = `gpos-modal${'-' + this.state.currentStage.toString().replace('.', '-')}`;

    return (
      <div>
        <Modal
          isOpen={ this.props.showGPOSModal }
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
  let totalGpos = getGposTotal(state);
  let availableGpos = getAvailableGpos(state);

  return {
    showGPOSModal: state.gpos.showGPOSModal,
    totalGpos,
    availableGpos,
    completedStages: state.gpos.completedStages
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleGPOSModal: GPOSActions.toggleGPOSModal,
    setCompletedStages: GPOSActions.setGposStages
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(GPOSModalWrapper);