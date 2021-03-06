import React from 'react';
import Translate from 'react-translate-component';
import {connect} from 'react-redux';
import {Modal, ModalBody} from 'react-modal-bootstrap';
import AppService from '../../../services/AppService';
import store from '../../../store/configureStore';
import AppActions from '../../../actions/AppActions';
import {bindActionCreators} from 'redux';
import {NavigateActions} from '../../../actions';

class CantConnectModal extends React.Component {

  tryAgainHandler=()=> {
    this.props.setDisable(true);
    AppService.init(store);
  }

  render() {
    return (
      <Modal
        isOpen={ this.props.showCantConnectModal }
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
          <div className='modal-dialog'>
            <div className='modal-dialogAlignOut'>
              <div className='modal-dialogAlignIn'>
                <div
                  className='modal-dialogContent modal-dialogContent-w400 modal-dialogContent-type02'> { /*eslint-disable-line */ }
                  {!store.getState().app.disableTryAgain?
                    <Translate
                      component='div'
                      className='modalTitle'
                      content='cant_connect_modal_blockchain.title'/>:
                    <Translate
                      component='div'
                      className='modalTitle'
                      content='cant_connect_modal_blockchain.reconnection'/>}
                  <div className='modalFooter text_c'>
                    <button onClick={ this.tryAgainHandler.bind(this) } className='btn btn-sbm' disabled={ this.props.tryagain }>
                      {!this.props.tryagain?
                        <Translate content='cant_connect_modal_blockchain.try_again'/>:
                        <span className='loader loader-white loader-xs' style={ {marginTop:'70px'} }/>}
                    </button>
                      :
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    showCantConnectModal : state.app.showCantConnectModal,
    tryagain : state.app.disableTryAgain
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    setShowCantConnectStatus: AppActions.setShowCantConnectStatus,
    setDisable: AppActions.setDisableTryAgain,
    navigateToSignIn : NavigateActions.navigateToSignIn,
    logout: AppActions.logout
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(CantConnectModal);
