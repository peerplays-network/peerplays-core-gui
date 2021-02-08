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
import {DateTimeFormat} from 'intl';
const getClientEnvironment = require('../../../config/env');
const env = getClientEnvironment();

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
    const dateCommit=__COMMIT_HASH__.split('Date:   ')[1].slice(8,10).split(' ')[0].length===1?'0'+__COMMIT_HASH__.split('Date:   ')[1].slice(8,10).split(' ')[0]:__COMMIT_HASH__.split('Date:   ')[1].slice(8,10).split(' ')[0];
    return (
      <div className='footer'>
        <div className='app__version'>
          {}
        </div>
        <div className='box footerRow'>
          <a className='footerList' target='_blank' href='https://www.peerplays.com/privacy/'>
            <span >
              <Translate component='span' content='footer.Privacy'/>
            </span>
          </a>
          <a className='footerList' target='_blank' href='https://pbsa.info/' >
            <span>
              <Translate component='span' content='footer.Info'/>
            </span>
          </a>
          <div className='app__version'>Connected to: {env.raw.name} blockchain</div>
          <div className='app__version'>Version: {Config.APP_VERSION}-{__COMMIT_HASH__.split('commit ')[1].slice(0,8)}
            {__COMMIT_HASH__.split('Date:   ')[1].slice(8,10).split(' ')[0].length!==1?
              `(${new Date(`${dateCommit} ${__COMMIT_HASH__.split('Date:   ')[1].slice(3,7)} ${__COMMIT_HASH__.split('Date:   ')[1].slice(20,24)} ${__COMMIT_HASH__.split('Date:   ')[1].slice(12,19)}`).toISOString()})`:
              `(${new Date(`${dateCommit} ${__COMMIT_HASH__.split('Date:   ')[1].slice(4,7)} ${__COMMIT_HASH__.split('Date:   ')[1].slice(19,23)} ${__COMMIT_HASH__.split('Date:   ')[1].slice(10,18)}`).toISOString()})`
            }
          </div>
          <div  className='footerList'>
            <span >
            &copy; <Translate component='span' content='footer.copyrights' className='footercopyright'/>
            </span>
          </div>
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
    updatedAt : state.explorerBlockchainPage.updatedAt
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
