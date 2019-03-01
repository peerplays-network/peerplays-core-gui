/**
 * Configure
 */
// Adds a .equals method to Array for use in shouldComponentUpdate
// This needs to be initalized here even though IntlStore is never used
import IntlStore from 'stores/IntlStore'; // eslint-disable-line
import store from 'store/configureStore';
import CONFIG from 'config/main';
/**
 * Libs
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, IndexRedirect, hashHistory} from 'react-router';
import {Provider} from 'react-redux';
import {syncHistoryWithStore} from 'react-router-redux';
import LocationConstants from 'constants/LocationConstants';

/**
 * Actions
 */
import AppActions from 'actions/AppActions';

/**
 * Services
 */
import AppService from 'services/AppService';

/**
 * Wrappers
 */
import {requireAuthentication} from './components/Auth/AuthenticatedComponent';

/**
 * Routes Components
 */
import AppContainer from './components/AppContainer';
import BalancesDashboard from './components/Dashboard/Balances/BalancesContainer';
import AdvancedOptionsDashboard from './components/Dashboard/AdvancedOptions/AdvancedOptions';
import ExplorerBlockChain from './components/Explorer/BlockChain/BlockChainContainer';
import ExploreContainer from './components/Explorer/ExploreContainer';
import ExploreAccounts from './components/Explorer/Accounts/Accounts';
import ExploreBasicAssets from './components/Explorer/BasicAssets';
import ExploreSmartCoins from './components/Explorer/SmartCoins';
import ExploreFeeSchedule from './components/Explorer/FeeSchedule/FeeSchedule';
import Settings from './components/Settings/SettingsContainer';
import PasswordSettings from './components/Settings/PasswordSettings';
import PermissionSettings from './components/Settings/PermissionSettings';
import Register from './components/Register/Register';
import VestingAccountContainer from './components/Account/Vesting/VestingAccountContainer';
import Login from './components/Login/Login';
import Help from './components/Help';
import Voting from './components/Voting/VotingContainer';
import Send from './components/Send/Send';
import Referrals from './components/Referrals/Referrals';
import Empty from './components/Empty';
import ClaimBtsContainer from './components/ClaimBts/ClaimBtsContainer';
import AboutContainer from './components/About/AboutContainer';
import ClaimSettings from './components/Settings/ClaimSettings';
require('./components/Utility/Prototypes'); /*eslint-disable-line */

/**
 * Init App
 */
AppService.init(store);

let routes = (
  <Route path='/' component={ AppContainer }>
    <IndexRedirect to='/dashboard'/>
    <Route path='/login' component={ Login }/>
    <Route path='/sign-up' component={ Register }/>
    <Route
      path='/account/vesting'
      component={ requireAuthentication(VestingAccountContainer) }
    />
    <Route path='/referrals' component={ requireAuthentication(Referrals) }/>
    <Route
      path='/dashboard'
      component={ requireAuthentication(BalancesDashboard) }
      onEnter={ () => {
        window.scrollTo(0, 0);
        store.dispatch(AppActions.setCurrentLocation(LocationConstants.DASHBOARD_BALANCES));
      } }
    />
    {/*
      <Route
        path="/exchange/:marketId"
        component={requireAuthentication(Exchange)}
        onEnter={() => {
          store.dispatch(AppActions.setCurrentLocation(LocationConstants.EXCHANGE));
        }}
        onLeave={() => {
          store.dispatch(AppActions.setCurrentLocation(null));
        }}
      />
    */}
    <Route path='explore'>
      <IndexRoute component={ requireAuthentication(AdvancedOptionsDashboard) }/>
      <Route
        path='voting'
        onEnter={ () => {
          store.dispatch(AppActions.setCurrentLocation(LocationConstants.VOTING));
        } }
        onLeave={ () => {
          store.dispatch(AppActions.setCurrentLocation(null));
        } }
      >
        <IndexRoute
          params={ {tab: 'proxy'} }
          component={ requireAuthentication(Voting) }
        />
        <Route
          params={ {tab: 'proxy'} }
          path='proxy'
          title='Proxy'
          component={ requireAuthentication(Voting) }
        />
        <Route
          params={ {tab: 'witness'} }
          path='witness'
          title='Witness'
          component={ requireAuthentication(Voting) }
        />
        <Route
          params={ {tab: 'committee'} }
          path='committee'
          title='Committee'
          component={ requireAuthentication(Voting) }
        />
        {
          /*
            <Route
              params={{tab: 'proposals'}}
              path="proposals"
              title="Proposals"
              component={requireAuthentication(Voting)}
            />
          */
        }

      </Route>
      <Route path='blockchain' component={ requireAuthentication(ExploreContainer) }>
        <IndexRoute
          params={ {tab: 'blockchain'} }
          component={ requireAuthentication(ExplorerBlockChain) }
          onEnter={ () => {
            store.dispatch(AppActions.setCurrentLocation(LocationConstants.EXPLORER_BLOCK_CHAIN));
          } }
          onLeave={ () => {
            store.dispatch(AppActions.setCurrentLocation(null));
          } }
        />
        <Route
          path='accounts'
          params={ {tab: 'accounts'} }
          compoment={ requireAuthentication(ExploreAccounts) }
          onEnter={ () => {
            store.dispatch(AppActions.setCurrentLocation(LocationConstants.EXPLORER_ACCOUNTS));
          } }
          onLeave={ () => {
            store.dispatch(AppActions.setCurrentLocation(null));
          } }
        />
        <Route
          path='assets'
          params={ {tab: 'assets'} }
          compoment={ requireAuthentication(ExploreBasicAssets) }
        />
        <Route
          path='smartcoins'
          params={ {tab: 'smartcoins'} }
          compoment={ requireAuthentication(ExploreSmartCoins) }
        />
        <Route
          path='fee'
          params={ {tab: 'fee'} }
          compoment={ requireAuthentication(ExploreFeeSchedule) }
          onEnter={ () => {
            store.dispatch(AppActions.setCurrentLocation(LocationConstants.EXPLORER_FEE_SCHEDULE));
          } }
          onLeave={ () => {
            store.dispatch(AppActions.setCurrentLocation(null));
          } }
        />
      </Route>
    </Route>

    <Route path='send' component={ requireAuthentication(Send) }/>

    <Route path='settings' component={ requireAuthentication(Settings) }>
      <IndexRoute params={ {tab: 'access'} } component={ ClaimSettings } />
      <Route params={ {tab: 'password'} } path='password' component={ PasswordSettings } />
      <Route params={ {tab: 'permissions'} } path='permissions' component={ PermissionSettings } />
      <Route params={ {tab: 'claim'} } path='claim' />
    </Route>
    <Route path='/claims/bts' component={ ClaimBtsContainer }/>
    <Route path='/about' component={ AboutContainer }/>
    <Route path='/init-error' component={ Empty }/>
    {/*
      <Route
        path="/deposit-withdraw"
        component={requireAuthentication(DepositWithdrawContainer)}
        onEnter={() => { store.dispatch(AppActions
          .setCurrentLocation(LocationConstants.DEPOSIT_WITHDRAW))
        }}
        onLeave={() => {store.dispatch(AppActions.setCurrentLocation(null))}}
      />
    */}
    <Route path='/help' component={ Help }>
      <Route path=':path1' component={ Help }>
        <Route path=':path2' component={ Help }>
          <Route path=':path3' component={ Help }/>
        </Route>
      </Route>
    </Route>
  </Route>
);

ReactDOM.render(
  <Provider store={ store }>
    <Router history={ syncHistoryWithStore(hashHistory, store) } routes={ routes }/>
  </Provider>, document.getElementById('content'));

window.onunhandledrejection = (data) => {
  console.log(data);
};

if (CONFIG.__ELECTRON__) {
  let electron = window.require('electron');

  const {remote} = electron;
  const {Menu, MenuItem} = remote;

  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: 'Copy',
      click() {
        document.execCommand('copy');
      }
    })
  );
  menu.append(
    new MenuItem({
      label: 'Paste',
      click() {
        document.execCommand('paste');
      }
    })
  );

  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      menu.popup({window: remote.getCurrentWindow()});
    },
    false
  );

  let ipcRenderer = window.require('electron').ipcRenderer;

  ipcRenderer.on('window-will-close', () => {
    store.dispatch(AppActions.logout()).then(() => {
      ipcRenderer.send('window-is-logout');
    }).catch(() => {
      ipcRenderer.send('window-is-logout');
    });
  });
}