import React from 'react';
import Translate from 'react-translate-component';
import counterpart from 'counterpart';
import {connect} from 'react-redux';
import {Modal, ModalBody} from 'react-modal-bootstrap';

class TimeoutModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password_input: '',
      password_error: null
    };
  }
  reconnect() {
    console.log('reconnect');
  }

  onPasswordChange(e) {
    this.setState({password_input: e.target.value});
  }

  render() {
    let {password_input, password_error} = this.state;
    return (
      <Modal isOpen={ this.props.isOpen } autoFocus={ true }>
        <ModalBody>
          <div className='modal-dialog'>
            <div className='modal-dialogAlignOut'>
              <div className='modal-dialogAlignIn'>
                <div className='modal-dialogContent'>
                  <div className='modalTitle'><Translate content='timeout_modal.title' /></div>
                  <div className='row'>
                    <div className='col-12'>
                      <label className='label'><Translate content='modal.unlock.password' /></label>
                      <input
                        type='password'
                        className={ `field field-type2 ${password_error ? 'error' : null}` }
                        placeholder={ counterpart.translate('modal.unlock.password_placeholder') }
                        onChange={ this.onPasswordChange.bind(this) }
                        value={ password_input }
                        autoFocus={ true }
                      />
                      {
                        password_error
                          ? <span className='error__hint'>
                            {counterpart.translate('errors.incorrect_password')}
                          </span>
                          : null
                      }
                    </div>
                  </div>
                  <div className='modalFooter text_r'>
                    <button
                      type='button'
                      className='btn btn-neutral'
                      onClick={ this.onClose.bind(this) }
                    >
                      <Translate content='cancel' />
                    </button>
                    <button
                      type='button'
                      className='btn btn-success'
                      onClick={ this.reconnect.bind(this) }
                    >
                      <Translate content='modal.unlock.unlock_btn' />
                    </button>
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
    showTimeoutModal : state.app.showTimeoutModal
  };
};

export default connect(mapStateToProps)(TimeoutModal);