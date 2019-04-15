// Node.js example
/* running 'npm run build' is necessary before launching the examples */
let {Apis} = require('../lib');

// let wsString = 'wss://bitshares.openledger.info/ws';
let wsString = 'ws://127.0.0.1:8090';

function updateListener(object) {
  console.log('set_subscribe_callback update:\n', object);
}

Apis.instance(wsString, true).init_promise.then((res) => {
  console.log('connected to:', res[0].network);

  Apis.instance()
    .db_api()
    .exec('set_subscribe_callback', [updateListener, true]);
});
