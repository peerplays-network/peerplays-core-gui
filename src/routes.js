import React from 'react';
import {Route, IndexRoute, IndexRedirect} from 'react-router';

import LocationConstants from './constants/LocationConstants';
import App from './components/App';
import {requireAuthentication} from './components/Auth/AuthenticatedComponent';
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
import Timeout from './components/Timeout/Timeout';
import {AppActions} from './actions';

const routes = (store) => (
  <Route path='/' component={ App }>
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
    <Route path='/timeout'
      component={ Timeout }
      onEnter={ () => {
        store.dispatch(AppActions
          .setCurrentLocation(LocationConstants.TIMEOUT));
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

    <Route
      path='/games/rock-paper-scissors'
      onEnter={ () => {
        store.dispatch(AppActions
          .setCurrentLocation(LocationConstants.GAMES_ROCK_PAPER_SCISSOR_TOURNAMENTS));
      } }
      onLeave={ () => {
        store.dispatch(AppActions.setCurrentLocation(null));
      } }
    >

      <IndexRoute
        params={ {tab: 'dashboard'} }
        title='Dashboard'
      />
      <Route
        path='explore/all'
        params={ {tab: 'explore', tournamentsFilter: 'all'} }
        title='Explore All'
      />
      <Route
        path='explore/find'
        params={ {tab: 'find', tournamentsFilter: 'find'} }
        title='Find'
      />
      <Route
        path='create'
        params={ {tab: 'create'} }
        title='Create'
      />
      <Route
        path='dashboard'
        params={ {tab: 'dashboard'} }
        title='Dashboard Open'
      />
      <Route
        path='game/:id'
        title='Game'
      />
    </Route>
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

export default routes;