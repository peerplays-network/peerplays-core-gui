const endpoints = {
  environments: {
    alice: {
      apiEndpoints: [/* retrieved via a gist in ConnectManager */],
      faucetUrls: [
        'https://faucet.peerplays.download/faucet'
      ],
      prefix: 'PPY'
    },
    beatrice: {
      apiEndpoints: ['wss://pta.blockveritas.co/ws', 'wss://node.testnet.peerblock.trade', 'wss://api-ppy-beatrice.blckchnd.com', 'wss://api-beatrice01.eifos.org', 'wss://peerplaysblockchain.net/testnet/api', 'wss://api-testnet.ppy.alex-pu.info'],
      faucetUrls: [
        'https://beatrice-faucet.peerplays.download/faucet'
      ],
      prefix: 'TEST'
    }
  }
};
let current = 'beatrice'; // Set the current default environment.

// Check to make sure a valid target is specified.
if (process.env && process.env.TARGET && endpoints.environments[process.env.TARGET]) {
  current = process.env.TARGET;
  console.log(`Environment defined as ${current}`);
} else if (!process.env.TARGET) {
  console.warn(`Environment was not defined, using default. (${current})`);
} else if (!endpoints.environments[process.env.TARGET]) {
  console.warn(`Environment supplied is invalid, using default. (${current})`);
}

// Export the current endpoints config with the additional name property.
module.exports = Object.assign(endpoints.environments[current], {
  name: current
});
