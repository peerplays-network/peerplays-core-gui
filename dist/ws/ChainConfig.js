'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  core_asset: 'PPY',
  address_prefix: 'PPY',
  expire_in_secs: 15,
  expire_in_secs_proposal: 24 * 60 * 60,
  review_in_secs_committee: 24 * 60 * 60
};

var networks = {
  networks: {
    Peerplays: {
      core_asset: 'PPY',
      address_prefix: 'PPY',
      chain_id: '6b6b5f0ce7a36d323768e534f3edb41c6d6332a541a95725b98e28d140850134'
    },
    PeerplaysTestnet: {
      core_asset: 'PPYTEST',
      address_prefix: 'PPYTEST',
      chain_id: 'be6b79295e728406cbb7494bcb626e62ad278fa4018699cf8f75739f4c1a81fd'
    }
  }
};

var ChainConfig = function () {
  function ChainConfig() {
    _classCallCheck(this, ChainConfig);

    this.reset();
  }

  ChainConfig.prototype.reset = function reset() {
    Object.assign(this, defaults);
  };

  ChainConfig.prototype.setChainId = function setChainId(chainID) {
    var ref = Object.keys(networks);

    for (var i = 0, len = ref.length; i < len; i++) {
      var network_name = ref[i];
      var network = networks[network_name];

      if (network.chain_id === chainID) {
        this.network_name = network_name;

        if (network.address_prefix) {
          this.address_prefix = network.address_prefix;
        }

        return {
          network_name: network_name,
          network: network
        };
      }
    }

    if (!this.network_name) {
      console.log('Unknown chain id (this may be a testnet)', chainID);
    }
  };

  ChainConfig.prototype.setPrefix = function setPrefix() {
    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'PPY';

    this.address_prefix = prefix;
  };

  return ChainConfig;
}();

exports.default = new ChainConfig();
module.exports = exports['default'];