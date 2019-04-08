/* Libs */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

/* Components */
import {IntlProvider} from 'react-intl';
import NotificationSystem from 'react-notification-system';
import Header from 'components/Header/Header';
import TransactionConfirmModal from 'components/Modal/TransactionConfirmModal/TransactionConfirmModal'; // eslint-disable-line
import WalletUnlockModal from 'components/Modal/WalletUnlockModal';
import ViewMemoModal from 'components/Modal/ViewMemoModal';
import CantConnectModal from 'components/Modal/CantConnectModal/CantConnectModal';
import HelpModal from '../components/Help/HelpModal';
import intlData from 'components/Utility/intlData';
import CommonMessage from 'components/CommonMessage';

/* Other */
import {routerShape} from 'react-router/lib/PropTypes';
import AppActions from '../actions/AppActions';
import Config from '../../config/Config';
import TimeoutModal from './Modal/TimeoutModal';

class App extends React.Component {
  static contextTypes = {
    router: routerShape
  }

  render() {
    let content = null;
    let urlsWithYellowBackground = [
      '/claims/bts',
      '/about',
      '/init-error',
      '/sign-up',
      '/login',
      '/forgot-password',
      '/forgot-password/decrypt',
      '/forgot-password/change',
      '/create-account',
      '/restore-account',
      '/account/recovery',
      '/account/recovery/confirm',
      '/account/recovery/download'
    ];

    document.getElementsByTagName('body')[0].className = '';

    let loc = this.context.router.getCurrentLocation(),
      pathname = loc.pathname;

    if (this.props.syncIsFail) {
      content = (
        <div className='wrapper wrapper-with-footer'></div>
      );
    } else if (!this.props.dbIsInit || !this.props.dbDataIsLoad || !this.props.chainIsInit) {
      content = (<div></div>);
    } else if (urlsWithYellowBackground.indexOf(this.props.location.pathname) >= 0) {
      document.getElementsByTagName('body')[0].className = 'loginBg';
      content = (<div className='wrapper wrapper-with-footer'>{this.props.children}</div>);
    } else {

      content = (
        <div className='wrapper wrapper-with-footer'>
          <Header pathname={ pathname }/>
          <CommonMessage location='header' />
          {this.props.activeNotification ?
            <div className='message'>{this.props.children}</div>
            :
            <div className='no-message'>{this.props.children}</div>
          }
        </div>
      );
    }

    return (
      <div className='out'>
        {content}
        <NotificationSystem ref='notificationSystem' allowHTML={ true }/>
        <TransactionConfirmModal/>
        <WalletUnlockModal/>
        <CantConnectModal/>
        <TimeoutModal/>
        <ViewMemoModal/>
        <HelpModal/>
      </div>
    );
  }
}

function idleCheck(props) {
  console.log('idle logout timer started.', props);
  let t;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.addEventListener('scroll', resetTimer, true);

  function isIdle() {
    console.log('Logging out user due to inactivity.');
    props.setShowTimeoutModal(true);
    //props.logout();
  }

  function resetTimer() {
    console.log('idle logout timer reset.');
    clearTimeout(t);
    t = setTimeout(isIdle, Config.IDLE_TIMEOUT);
  }
}

class AppContainer extends React.Component {
  componentDidMount() {
    // Start lidle checker to autologout idle users.
    idleCheck(this.props);
  }

  render() {
    return (
      <IntlProvider
        locale={ this.props.locale.replace(/cn/, 'zh') }
        formats={ intlData.formats }
        initialNow={ Date.now() }>
        <App { ...this.props }/>
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.app.status,
    dbIsInit: state.app.dbIsInit,
    dbDataIsLoad: state.app.dbDataIsLoad,
    chainIsInit: state.app.chainIsInit,
    syncIsFail: state.app.syncIsFail,
    showHelpPopup: state.helpReducer.showHelpModal,
    locale: state.settings.locale,
    activeNotification: state.commonMessage.get('activeMessage'),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    logout: AppActions.logout,
    setShowTimeoutModal: AppActions.setShowTimeoutModal
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);