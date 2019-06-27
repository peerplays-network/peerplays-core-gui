import React from 'react';
import {PropTypes} from 'react';
import ZfApi from 'react-foundation-apps/src/utils/foundation-api';
import Modal from 'react-foundation-apps/src/modal';
import Trigger from 'react-foundation-apps/src/trigger';
import SettingsActions from 'actions/SettingsActions';
import Translate from 'react-translate-component';

class ConfirmModal extends React.Component {
  constructor() {
    super();
    this.state = {show: true};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.content !== this.state.content;
  }

  show(content, confirmText, callback) {
    this.setState({
      content: content,
      confirmText: confirmText,
      callback: callback
    });

    ZfApi.publish(this.props.modalId, 'open');
  }

  confirmClicked(e) {
    e.preventDefault();
    ZfApi.publish(this.props.modalId, 'close');
    this.state.callback();
  }

  _onCheck(e) {
    e.preventDefault();
    this.setState({show: !this.state.show});
    SettingsActions.changeSetting({setting: this.props.setting, value: !this.props.value});
    this.forceUpdate();
  }

  render() {
    return (
      <Modal id={ this.props.modalId } overlay={ true }>
        <Trigger close={ this.props.modalId }>
          <a href='#' className='close-button'>&times;</a> {/* eslint-disable-line */}
        </Trigger>
        <div className='grid-block vertical'>
          {this.state.content}

          {this.props.setting ?
            (<div style={ {marginBottom: '1rem', marginTop: '1rem'} }>
              <Translate component='label' content='settings.always_confirm' />
              {/* This won't work using a single <input> with checked={this.state.show},
              not sure why */
                this.state.show
                  ? <input
                    key='true_checked'
                    type='checkbox'
                    checked={ true }
                    onChange={ this._onCheck.bind(this) }/>
                  : <input
                    key='false_checked'
                    type='checkbox'
                    checked={ false }
                    onChange={ this._onCheck.bind(this) }/>
              }
            </div>)
            : null}
          <div className='grid-content button-group no-overflow'>
            <a
              className='button'
              href onClick={ this.confirmClicked.bind(this) }>
              {this.state.confirmText}
            </a>
            <Trigger close={ this.props.modalId }>
              <div className='button'><Translate content='account.perm.cancel' /></div>
            </Trigger>
          </div>
        </div>
      </Modal>
    );
  }
}

ConfirmModal.defaultProps = {
  modalId: 'confirm_modal',
  setting: null
};

ConfirmModal.propTypes = {
  modalId: PropTypes.string.isRequired,
  setting: PropTypes.string,
  value: PropTypes.bool
};

export default ConfirmModal;
