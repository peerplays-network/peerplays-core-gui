const endpoints = {
  environments: {
    alice: {
      apiEndpoints: [/* retrieved via a gist in ConnectManager */],
      faucetUrls: [
        'https://faucet.peerplays.download/faucet'
      ],
      prefix: 'PPY'
    },
    elizabeth: {
      apiEndpoints: ['wss://elizabeth.peerplays.download/api'],
      faucetUrls: [
        'https://elizabeth-faucet.peerplays.download/api/v1/accounts'
      ],
      prefix: 'TEST'
    }
  }
};
let current = 'elizabeth'; // Set the current default environment.

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