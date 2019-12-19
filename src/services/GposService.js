import Repository from '../repositories/chain/repository';

class GposService {
  /**
   * Request GPOS Information object for a user from the Peerplays Blockchain.
   *
   * @static
   * @param {string} accountId - ie: "1.2.334"
   * @returns {object} - ie:
   * {
   *  "vesting_factor", "award": {
   *    "amount", "asset_id"
   *  },
   *  "total_amount"
   * }
   * @memberof GposService
   */
  static fetchGposInfo(accountId) {
    return Promise.all([Repository.getGposInfo(accountId)])
      .then((results) => {
        let gposInfo = results[0];

        if (gposInfo) {
          return {
            gposInfo
          };
        }
      });
  }
}

export default GposService;