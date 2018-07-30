'use strict';

exports.__esModule = true;

var _secureRandom = require('secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _bytebuffer = require('bytebuffer');

var _peerplaysjsWs = require('peerplaysjs-ws');

var _ecc = require('../../ecc');

var _serializer = require('../../serializer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helper = {
  unique_nonce_entropy: null,
  unique_nonce_uint64: function unique_nonce_uint64() {
    var entropy = this.update_entropy();

    var long = _bytebuffer.Long.fromNumber(Date.now());
    long = long.shiftLeft(8).or(_bytebuffer.Long.fromNumber(entropy));
    // console.log('unique_nonce_uint64 shift8\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    return long.toString();
  },
  update_entropy: function update_entropy() {
    if (this.unique_nonce_entropy === null) {
      // console.log('... secureRandom.randomUint8Array(1)[0]',secureRandom.randomUint8Array(1)[0])
      return parseInt(_secureRandom2.default.randomUint8Array(1)[0], 10);
    }

    return ++this.unique_nonce_entropy % 256;
  },


  /* Todo, set fees */
  to_json: function to_json(tr) {
    var broadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var tr_object = _serializer.ops.signed_transaction.toObject(tr);

    if (broadcast) {
      var net = _peerplaysjsWs.Apis.instance().network_api();
      console.log('... tr_object', JSON.stringify(tr_object));
      return net.exec('broadcast_transaction', [tr_object]);
    }

    return tr_object;
  },
  signed_tr_json: function signed_tr_json(tr, private_keys) {
    var tr_buffer = _serializer.ops.transaction.toBuffer(tr);
    tr = _serializer.ops.transaction.toObject(tr);
    tr.signatures = function () {
      var result = [];

      for (var i = 0; private_keys.length > 0 ? i < private_keys.length : i > private_keys.length; private_keys.length > 0 ? i++ : i++) {
        var private_key = private_keys[i];
        result.push(_ecc.Signature.signBuffer(tr_buffer, private_key).toHex());
      }

      return result;
    }();
    return tr;
  },
  expire_in_min: function expire_in_min(min) {
    return Math.round(Date.now() / 1000) + min * 60;
  },
  seconds_from_now: function seconds_from_now(timeout_sec) {
    return Math.round(Date.now() / 1000) + timeout_sec;
  },


  /**
    Print to the console a JSON representation of any object in
    @graphene/serializer { types }
  */
  template: function template(serializer_operation_type_name) {
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { use_default: true, annotate: true };

    var so = _serializer.types[serializer_operation_type_name];

    if (!so) {
      throw new Error('unknown serializer_operation_type ' + serializer_operation_type_name);
    }

    return so.toObject(undefined, debug);
  },
  new_operation: function new_operation(serializer_operation_type_name) {
    var so = _serializer.types[serializer_operation_type_name];

    if (!so) {
      throw new Error('unknown serializer_operation_type ' + serializer_operation_type_name);
    }

    var object = so.toObject(undefined, { use_default: true, annotate: true });
    return so.fromObject(object);
  },
  instance: function instance(ObjectId) {
    return ObjectId.substring('0.0.'.length);
  }
};
exports.default = helper;
module.exports = exports['default'];