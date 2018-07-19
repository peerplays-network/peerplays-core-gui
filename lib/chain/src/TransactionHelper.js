import secureRandom from 'secure-random';

import {Long} from 'bytebuffer';

import {Apis} from 'peerplaysjs-ws';
import {Signature} from '../../ecc';
import {ops, types} from '../../serializer';

const helper = {
  unique_nonce_entropy: null,
  unique_nonce_uint64() {
    let entropy = this.update_entropy();

    let long = Long.fromNumber(Date.now());
    long = long.shiftLeft(8).or(Long.fromNumber(entropy));
    // console.log('unique_nonce_uint64 shift8\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    return long.toString();
  },

  update_entropy() {
    if (this.unique_nonce_entropy === null) {
      // console.log('... secureRandom.randomUint8Array(1)[0]',secureRandom.randomUint8Array(1)[0])
      return parseInt(secureRandom.randomUint8Array(1)[0], 10);
    }

    return ++this.unique_nonce_entropy % 256;
  },

  /* Todo, set fees */
  to_json(tr, broadcast = false) {
    let tr_object = ops.signed_transaction.toObject(tr);

    if (broadcast) {
      let net = Apis.instance().network_api();
      console.log('... tr_object', JSON.stringify(tr_object));
      return net.exec('broadcast_transaction', [tr_object]);
    }

    return tr_object;
  },

  signed_tr_json(tr, private_keys) {
    let tr_buffer = ops.transaction.toBuffer(tr);
    tr = ops.transaction.toObject(tr);
    tr.signatures = (() => {
      let result = [];

      for (
        let i = 0;
        private_keys.length > 0 ? i < private_keys.length : i > private_keys.length;
        private_keys.length > 0 ? i++ : i++
      ) {
        let private_key = private_keys[i];
        result.push(Signature.signBuffer(tr_buffer, private_key).toHex());
      }

      return result;
    })();
    return tr;
  },

  expire_in_min(min) {
    return Math.round(Date.now() / 1000) + min * 60;
  },

  seconds_from_now(timeout_sec) {
    return Math.round(Date.now() / 1000) + timeout_sec;
  },

  /**
    Print to the console a JSON representation of any object in
    @graphene/serializer { types }
*/
  template(serializer_operation_type_name, debug = {use_default: true, annotate: true}) {
    let so = types[serializer_operation_type_name];

    if (!so) {
      throw new Error(`unknown serializer_operation_type ${serializer_operation_type_name}`);
    }

    return so.toObject(undefined, debug);
  },

  new_operation(serializer_operation_type_name) {
    let so = types[serializer_operation_type_name];

    if (!so) {
      throw new Error(`unknown serializer_operation_type ${serializer_operation_type_name}`);
    }

    let object = so.toObject(undefined, {use_default: true, annotate: true});
    return so.fromObject(object);
  },

  instance(ObjectId) {
    return ObjectId.substring('0.0.'.length);
  }
};
export default helper;
