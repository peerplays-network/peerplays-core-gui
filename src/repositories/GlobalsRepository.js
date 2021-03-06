import {Apis} from 'peerplaysjs-lib';

class GlobalsRepository {
  static fetchDynamicGlobalProperties() {
    return Apis.instance().db_api().exec('get_dynamic_global_properties', []).then((properties) => {
      return properties;
    }).catch(function (error) {
      console.log('GlobalsRepository', error);
    });
  }
}

export default GlobalsRepository;
