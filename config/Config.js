const _ = require('lodash');
const {version} = require('../package.json');
const getClientEnvironment = require('./env');
const env = getClientEnvironment();
const {Manager, ChainWebSocket} = require('../../peerplaysjs-ws/');
// Get the endpoints available.
const blockchainUrls = env.raw.apiEndpoints;
// Get the faucet endpoints available.
const faucetUrls = env.raw.faucetUrls;

// Shuffle the available enpoints.
const shuffledFaucetUrls = _.shuffle(faucetUrls);
let chainUrls = ['wss://api.ppy.us.altcap.io'];
let x = new Manager({
  urls: chainUrls
});

let conn = new ChainWebSocket(x.url, () => {});

x.ping(conn).then((response) => {
  console.log('ping success: ', true);
}).catch((err) => {
  console.log('config ping error: ', err);
});

const Config = {
  APP_VERSION: version,
  APP_PACKAGE_VERSION: version,
  BLOCKCHAIN_URLS: blockchainUrls,
  FAUCET_URLS: shuffledFaucetUrls,

  CORE_ASSET: 'PPY',
  FAUCET_URL: 'faucetUrls',
  BITSHARES_WS: 'wss://bitshares.openledger.info/ws',
  SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME: 'ppcoreupdates',
  ACTIVE_WITNESS_ONLY: false,

  commonMessageModule: {
    numOfCommonMessageToDisplay: 1,
    sortingMethod: 'recent', // recent OR oldest
    timeout: 7500, // 7.5 seconds for auto-dismissal messages
    disableActionsInRedux: true
  },
};

module.exports = Config;