import Repository from '../repositories/chain/repository';
import Config from '../../config/Config';

/**
 * Is used in ChainStoreService
 */
class SendService {

  constructor() {
    this.assetSymbol = Config.CORE_ASSET;
  }

  /**
   * Update Send page data
   *
   * @param account
   */
  static fetchData() {
    return Promise.all([
      Repository.getObject('2.0.0'),
      Repository.getObject('2.1.0'),
      Repository.getObject('1.3.0')
    ]).then((results) => {
      let object200 = results[0].toJS();
      let object210 = results[1].toJS();
      let coreAsset = results[2].toJS();
      return {
        head_block_number: object210.head_block_number,
        last_irreversible_block_num: object210.last_irreversible_block_num,
        recently_missed_count: object210.recently_missed_count,
        time: object210.time,
        block_interval: object200.parameters.block_interval,
        coreAsset: coreAsset,
        latestFetchedBlocks: []
      };
    });
  }
}

export default SendService;