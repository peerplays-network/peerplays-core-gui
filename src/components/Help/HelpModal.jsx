import React from 'react';
// import ReactDOM from 'react-dom';
import Translate from 'react-translate-component';
import {connect} from 'react-redux';
import {Modal, ModalHeader, ModalTitle} from 'react-modal-bootstrap';
import {HelpActions, NavigateActions} from '../../actions';
import {bindActionCreators} from 'redux';
import AppUtils from '../../utility/AppUtils';

class HelpModal extends React.Component {
  onClickClose(e) {
    this.hideModal();
    e.preventDefault();
  }

  hideModal() {
    this.props.toggleHelpModal(false);
  }

  onClickNavigateToClaim(e) {
    this.hideModal();
    this.props.navigateToSettingsClaim();
    e.preventDefault();
  }

  render() {
    return (
      <Modal
        className='backdrop-help'
        isOpen={ this.props.showHelpModal }
        backdrop={ true }
        keyboard={ true }
        onRequestHide={ this.hideModal.bind(this) }>
        <div className='modal-dialogContent w-900'>
          <ModalHeader closeButton>
            <ModalTitle>
              <Translate component='div' className='modalTitle help' content='help.title'/>
              <a
                href='/' onClick={ this.onClickClose.bind(this) } className='modalClose icon-close'>
              </a>
            </ModalTitle>
          </ModalHeader>
          <div
            ref={ (modal) => this.modal = modal }
            style={ {maxHeight: 'calc(100vh - 210px)', overflowY: 'auto'} }
          >
            <div className='modalBody'>
              <div className='modalBody-text-body'>
                <Translate component='div' className='help__h3' content='help.title_welcome'/>
                <div className='help__section'>
                  <div className='help__important'>
                    <Translate
                      component='div'
                      className='help__importantTitle'
                      content='help.important_title'/>
                    <Translate
                      component='div'
                      className='help__importantText'
                      content='help.important_note'/>
                  </div>
                  <div className='help__text'>
                    <Translate component='p' content='help.introduce_note'/>
                  </div>
                </div>

                <ul className='help__linkList'>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.my_funds'
                      // onClick={ () => this.scrollToHeaderByRefName(this, 'fundsAnchor') }/>
                      onClick={ () => AppUtils.scrollToRef(this.fundsAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.play'
                      onClick={ () => AppUtils.scrollToRef(this.playAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.gpos'
                      onClick={ () => AppUtils.scrollToRef(this.gposAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.vote'
                      onClick={ () => AppUtils.scrollToRef(this.voteAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.network'
                      onClick={ () => AppUtils.scrollToRef(this.networkAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.settings'
                      onClick={ () => AppUtils.scrollToRef(this.settingsAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.help'
                      onClick={ () => AppUtils.scrollToRef(this.helpAnchor, this.modal) }/>
                  </li>
                  <li className='help__linkLi'>
                    <Translate
                      component='a'
                      className='help__link'
                      content='help.anchors.notifications'
                      onClick={ () => AppUtils.scrollToRef(this.notificationsAnchor, this.modal) }/>
                  </li>
                </ul>

                <div ref={ (fundsAnchor) => this.fundsAnchor = fundsAnchor }>
                  <Translate component='div' className='help__h3' content='help.my_funds.title'/>
                  <div className='help__section'>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.my_funds.note_1'/>
                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.my_funds.balances.header'/>
                    <div className='help__sectionSub'>
                      <Translate
                        component='p'
                        className='text'
                        content='help.my_funds.balances.text_1'/>
                      <ul className='help__list'>
                        <Translate
                          component='li' className='' content='help.my_funds.balances.text_2'/>
                        <Translate
                          component='li' className='' content='help.my_funds.balances.text_3'/>
                        <Translate
                          component='li' className='' content='help.my_funds.balances.text_4'/>
                      </ul>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.my_funds.recent_activity.header'/>

                    <div className='help__sectionSub'>
                      <Translate
                        component='p'
                        className='text'
                        content='help.my_funds.recent_activity.text_1'/>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.my_funds.send.header'/>
                    <div className='help__sectionSub'>
                      <Translate
                        component='p'
                        unsafe={ true }
                        className='text'
                        content='help.my_funds.send.text_1'/>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.my_funds.overview.header'/>

                    <div className='help__sectionSub'>
                      <Translate
                        component='p'
                        className='text'
                        content='help.my_funds.overview.text_1'/>
                      <Translate
                        component='p'
                        className='text'
                        content='help.my_funds.overview.text_2'/>
                      <Translate
                        component='p'
                        className='text'
                        content='help.my_funds.overview.text_3'/>
                    </div>
                  </div>
                </div>

                <div ref={ (playAnchor) => this.playAnchor = playAnchor }>
                  <Translate component='div' className='help__h3' content='help.play.title'/>
                  <div className='help__section'>
                    <Translate component='div' className='help__text' content='help.play.text_1'/>
                  </div>
                </div>

                <div ref={ (gposAnchor) => this.gposAnchor = gposAnchor }>
                  <Translate component='div' className='help__h3' content='help.gpos.title'/>
                  <div className='help__section'>
                    <Translate component='div' className='help__text' content='help.gpos.text_1'/>
                    <p></p>
                    <Translate component='div' className='help__text' content='help.gpos.text_2'/>
                  </div>
                </div>

                <div ref={ (voteAnchor) => this.voteAnchor = voteAnchor }>
                  <Translate component='div' className='help__h3' content='help.vote.title'/>
                  <div className='help__section'>
                    <Translate component='div' className='help__text' content='help.vote.note_1'/>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.vote.proxy.header'/>
                    <div className='help__sectionSub'>
                      <Translate component='p' className='' content='help.vote.proxy.text_1'/>
                      <Translate component='p' className='' content='help.vote.proxy.text_2'/>
                      <Translate component='p' className='' content='help.vote.proxy.text_3'/>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.vote.witness.header'/>

                    <div className='help__sectionSub'>
                      <Translate
                        component='div' className='text' content='help.vote.witness.text_1'/>

                      <ul className='help__list'>
                        <Translate
                          component='li'
                          unsafe={ true }
                          className=''
                          content='help.vote.witness.li_1'/>
                        <Translate
                          component='li'
                          unsafe={ true }
                          className=''
                          content='help.vote.witness.li_2'/>
                      </ul>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.vote.advisors.header'/>
                    <div className='help__sectionSub'>
                      <Translate
                        component='p' className='text' content='help.vote.advisors.text_1'/>
                      <ul className='help__list'>
                        <Translate
                          component='li'
                          unsafe={ true }
                          className=''
                          content='help.vote.advisors.li_1'/>
                        <Translate
                          component='li'
                          unsafe={ true }
                          className=''
                          content='help.vote.advisors.li_2'/>
                      </ul>
                    </div>
                  </div>
                </div>

                <div ref={ (networkAnchor) => this.networkAnchor = networkAnchor }>
                  <Translate component='div' className='help__h3' content='help.network.title'/>
                  <div className='help__section'>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.network.note_1'/>

                    <Translate
                      component='div'
                      className='help__h5'
                      content='help.network.blockchain.header'/>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.network.blockchain.note'/>

                    <Translate
                      component='div'
                      className='help__h5'
                      content='help.network.accounts.header'/>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.network.accounts.note'/>

                    <Translate
                      component='div'
                      className='help__h5'
                      content='help.network.fee.header'/>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.network.fee.note'/>

                  </div>
                </div>

                <div ref={ (settingsAnchor) => this.settingsAnchor = settingsAnchor }>
                  <Translate component='div' className='help__h3' content='help.settings.title'/>
                  <div className='help__section'>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.settings.note_1'/>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.settings.api_access.header'/>
                    <div className='help__sectionSub'>
                      <Translate
                        component='p' className='' content='help.settings.api_access.note'/>
                    </div>

                    <Translate
                      component='div'
                      className='help__h4'
                      content='help.settings.claim.header'/>
                    <div className='help__sectionSub'>
                      <Translate
                        component='p'
                        className=''
                        content='help.settings.claim.note'/>
                    </div>
                    <a
                      onClick={ (e) => {
                        window.open('https://www.peerplays.com/wp-content/uploads/2017/11/' +
                          'Howto-Claim-Your-PPY-Tokens.pdf',
                        'newwindow', 'width=500, height=400');
                        e.preventDefault();
                      } }
                      href='https://www.peerplays.com/wp-content/uploads/2017/11/Howto-Claim-Your-PPY-Tokens.pdf' /* eslint-disable-line */
                      className='help__link txt-low'>
                      <Translate component='span' content='help.help.link_pdf'/>
                    </a>
                  </div>
                </div>

                <div ref={ (helpAnchor) => this.helpAnchor = helpAnchor }>
                  <Translate component='div' className='help__h3' content='help.help.title'/>
                  <div className='help__section'>
                    <Translate component='div' className='help__text' content='help.help.note'/>
                  </div>
                </div>

                <div
                  ref={ (notificationsAnchor) => this.notificationsAnchor = notificationsAnchor }
                >
                  <Translate
                    component='div'
                    className='help__h3'
                    content='help.notifications.title'/>
                  <div className='help__section'>
                    <Translate
                      component='div'
                      className='help__text'
                      content='help.notifications.note'/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    showHelpModal : state.helpReducer.showHelpModal
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleHelpModal: HelpActions.toggleHelpModal,
    navigateToSettingsClaim: NavigateActions.navigateToSettingsClaim
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(HelpModal);