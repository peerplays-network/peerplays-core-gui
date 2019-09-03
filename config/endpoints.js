const endpoints = {
  environments: {
    alice: {
      apiEndpoints: [
        'wss://api.eifos.org', // eifos-witness
        'wss://api.ppy.us.altcap.io', // winner.winner.chicken.dinner
        'wss://api.ppy.nuevax.com', // nuevax
        'ws://18.184.122.253:8090', // phi-guy
        'wss://peerplaysblockchain.net/mainnet/api', // houdini-witness
        'wss://ppyseed.spacemx.tech', // spacecrypt-witness
        'wss://api.ppy.alex-pu.info', // alex-pu
        'wss://ip254.ip-91-121-48.eu', // melea-trust
        'wss://ppyws.roelandp.nl/ws', // roelandp
        'wss://api.ppy.blckchnd.com', // blckchnd
        'wss://pma.blockveritas.co/ws', // taconator-witness-wallet
        'wss://node.peerblock.trade:8090', // bitcoinsig
        'wss://api2.ppy.blckchnd.com/ws' // royal-flush
      ],
      faucetUrls: [
        'https://faucet.peerplays.download/faucet'
      ],
      prefix: 'PPY'
    }
  }
};
let current = 'fred'; // Set the current default environment.

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