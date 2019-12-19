import {Apis} from 'peerplaysjs-lib';

class ObjectRepository {
  static fetchObjectsByIds(ids = []) {
    return Apis.instance().db_api().exec('get_objects', [ids]).then(function (optional_objects) {
      return optional_objects;
    }).catch(function (error) {
      console.log('ObjectRepository', error);
    });
  }

  static getTransactionFee(operations, assetId) {
    return Apis.instance().db_api().exec('get_required_fees', [[operations], assetId]).then((res) => res).catch((err) => console.log(err));
  }
}

export default ObjectRepository;