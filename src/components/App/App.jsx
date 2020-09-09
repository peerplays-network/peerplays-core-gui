import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import NotificationSystem from 'react-notification-system';
import {IntlProvider} from 'react-intl';
import {bindActionCreators} from 'redux';
import {routerShape} from 'react-router/lib/PropTypes';
import intlData from '../Utility/intlData';
import Config from '../../../config/Config';
import {AppActions, NavigateActions, GPOSActions} from '../../actions';
import CantConnectModal from '../Modal/CantConnectModal/CantConnectModal';
import CommonMessage from '../CommonMessage';
import GPOSModalWrapper from '../Modal/GPOSModal';
import HelpModal from '../Help/HelpModal';
import TransactionConfirmModal from '../Modal/TransactionConfirmModal/TransactionConfirmModal';
import WalletUnlockModal from '../Modal/WalletUnlockModal';
import ViewMemoModal from '../Modal/ViewMemoModal';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SplashScreen from '../SplashScreen/SplashScreen';

class App extends PureComponent {
  _notificationSystem = null;
  constructor(props) {
    super(props);

    this.idleCheck = this.idleCheck.bind(this);
  }

  static contextTypes = {
    router: routerShape
  };

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentDidUpdate(prevProps) {
    // Start lidle checker to autologout idle users.
    if (prevProps !== this.props) {
      this.idleCheck(this.props);
    }
  }

  idleCheck(props) {
    let t;
    window.onclick = resetTimer;
    window.onkeypress = resetTimer;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;
    window.ontouchstart = resetTimer;
    window.addEventListener('scroll', resetTimer, true);

    function isIdle() {
      console.warn('Logging out user due to inactivity.');

      // Close modals
      props.toggleGPOSModal();

      props.timeout();
      props.setCurrentLocation('TIMEOUT');
    }

    function resetTimer() {
      clearTimeout(t);

      if (props.isLogin !== false) {
        t = setTimeout(isIdle, Config.IDLE_TIMEOUT);
      }
    }
  }

  render() {
    let content = null;
    let contentfooter = null;
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
      content = <div className='wrapper wrapper-with-footer'></div>;
    } else if (!this.props.dbIsInit || !this.props.dbDataIsLoad || !this.props.chainIsInit) {
      content = <SplashScreen />;
    } else if (urlsWithYellowBackground.indexOf(this.props.location.pathname) >= 0) {
      document.getElementsByTagName('body')[0].className = 'loginBg';
      content = <div className='wrapper wrapper-with-footer'>{this.props.children}</div>;
    } else {
      content = (
          <div className='wrapper wrapper-with-footer'>
            <Header pathname={ pathname } />
            <div>
              <CommonMessage location='header' />
              <div>{this.props.children}</div>
            </div> 
          </div>
      );
      contentfooter =(
        <footer>
          <Footer pathname={ pathname } />  
        </footer>
          
      )
    }

    return (
      <IntlProvider
        locale={ this.props.locale.replace(/cn/, 'zh') }
        formats={ intlData.formats }
        initialNow={ Date.now() }
      >
        <div className='out'>
          {content}
          <NotificationSystem ref='notificationSystem' allowHTML={ true } />
          <TransactionConfirmModal />
          <WalletUnlockModal />
          <CantConnectModal />
          <ViewMemoModal />
          <HelpModal />
          <GPOSModalWrapper />
          {contentfooter}
        </div>
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
    isLogin: state.app.isLogin,
    activeNotification: state.commonMessage.get('activeMessage'),
    headerMessages: state.commonMessage.get('headerMessages')
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    timeout: AppActions.timeout,
    toggleGPOSModal: GPOSActions.toggleGPOSModal,
    navigateToTimeout: NavigateActions.navigateToTimeout,
    setCurrentLocation: AppActions.setCurrentLocation
  },
  dispatch
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
