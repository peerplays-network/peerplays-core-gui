import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import AccountReducer from './AccountReducer';
import SettingsReducer from './SettingsReducer';
import PageSettingsReducer from './PageSettingsReducer';
import WalletReducer from './WalletReducer';
import WalletDataReducer from './WalletDataReducer';
import PrivateKeyReducer from './PrivateKeyReducer';
import AddressIndexReducer from './AddressIndexReducer';
import LoginPageReducer from './LoginPageReducer';
import RegisterReducer from './RegisterReducer';
import AppReducer from './AppReducer';
import SendPageReducer from './SendPageReducer';
import TransactionConfirmReducer from './TransactionConfirmReducer';
import VotingReducer from './VotingReducer';
import ClaimBtsReducer from './ClaimBtsReducer';
import DashboardPageReducer from './DashboardPageReducer';
import ExplorerBlockchainPageReducer from './ExplorerBlockchainPageReducer';
import ExploreFeeScheduleReducer from './ExploreFeeScheduleReducer';
import ExchangePageReducer from './ExchangePageReducer';
import ReferralsPageReducer from './ReferralsPageReducer';
import AccountVestingPageReducer from './AccountVestingPageReducer';
import SoftwareUpdateReducer from './SoftwareUpdateReducer';
import NotificationsReducer from './NotificationsReducer';
import HelpReducer from './HelpReducer';
import MemoReducer from './MemoReducer';
import CommonMessageReducer from './CommonMessageReducer';

import {
  reducer as formReducer
} from 'redux-form';


const rootReducer = combineReducers({
  routing: routerReducer,
  account: AccountReducer,
  accountVestingPageReducer: AccountVestingPageReducer,
  addressIndex: AddressIndexReducer,
  app: AppReducer,
  claimBtsReducer: ClaimBtsReducer,
  commonMessage: CommonMessageReducer,
  dashboardPage: DashboardPageReducer,
  exchangePageReducer: ExchangePageReducer,
  explorerBlockchainPage: ExplorerBlockchainPageReducer,
  exploreFeeSchedule: ExploreFeeScheduleReducer,
  form: formReducer,
  helpReducer: HelpReducer,
  loginPage: LoginPageReducer,
  memoModal: MemoReducer,
  notificationsReducer: NotificationsReducer,
  pageSettings: PageSettingsReducer,
  privateKey: PrivateKeyReducer,
  referralsPageReducer: ReferralsPageReducer,
  register: RegisterReducer,
  sendPage: SendPageReducer,
  settings: SettingsReducer,
  softwareUpdateReducer: SoftwareUpdateReducer,
  transactionConfirm: TransactionConfirmReducer,
  voting: VotingReducer,
  wallet: WalletReducer,
  walletData: WalletDataReducer
});

export default rootReducer;