import {Apis} from 'peerplaysjs-ws';

class Api {
  lookupAccounts(startChar, limit) {
    return Apis.instance().db_api().exec('lookup_accounts', [
      startChar, limit
    ]);
  }
}

export default new Api();
