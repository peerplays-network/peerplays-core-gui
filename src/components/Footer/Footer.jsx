import React from 'react';
import {Link} from 'react-router';
import counterpart from 'counterpart';
import {connect} from 'react-redux';
import classNames from 'classnames';
import Notices from '../Header/Notices';
import {AppActions, HelpActions} from '../../actions';
import Translate from 'react-translate-component';
import {bindActionCreators} from 'redux';
import Config from '../../../config/Config';

class Footer extends React.Component {
  onLogoutClick(e) {
    e.preventDefault();
    this.props.logout();
  }

  onClickHelpLink(e) {
    this.props.toggleHelpModal(true);
    e.preventDefault();
  }

  render() {
    return (
      <div className='footer'>
        <div className='app__version'>
        {}

        </div>
              
              <div className='box footerRow'>
                {/* <span className-="col-4"> */}
                  {/* <Link to='/dashboard' className = 'logo' >
                    <img src='images/logo_pp-2.png' alt=''/>
                  </Link> */}
                  <a className="footerList" target="_blank" href='https://www.peerplays.com/privacy/'>
                      <span >
                          <Translate component='span' content='footer.Privacy'/>
                      </span>
                  </a>
                  <a className="footerList" target="_blank" href='https://pbsa.info/' >
                      <span>
                          <Translate component='span' content='footer.Info'/>
                      </span>
                  </a>   
                {/* </span> */}
                <div className='app__version'>Connected to: {Config.BLOCKCHAIN_URLS}</div>
                <div className='app__version'>{Config.APP_VERSION}</div>
                <a  className='footerList'>
                  <span >
                  &copy; <Translate component='span' content='footer.copyrights' className="footercopyright"/>
                  </span>
                </a>
              </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    active : state.active,
    wallet : state.walletData.wallet,
    linkedAccounts : state.account.linkedAccounts,
    currentAccount : state.account.currentAccount,
    starredAccounts : state.account.starredAccounts,
    locked : state.wallet.locked,
    current_wallet : state.wallet.currentWallet,
    updatedAt : state.explorerBlockchainPage.updatedAt,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    logout: AppActions.logout,
    toggleHelpModal: HelpActions.toggleHelpModal
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
