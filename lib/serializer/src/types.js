// Low-level types that make up operations

import {ChainConfig} from 'peerplaysjs-ws';
import v from './SerializerValidation';
import fp from './FastParser';

import ChainTypes from '../../chain/src/ChainTypes';
import ObjectId from '../../chain/src/ObjectId';

import {PublicKey, Address} from '../../ecc';

let MIN_SIGNED_32 = -1 * Math.pow(2, 31);
let MAX_SIGNED_32 = Math.pow(2, 31) - 1;

const HEX_DUMP = process.env.npm_config__graphene_serializer_hex_dump;

let strCmp = (a, b) => {
  let result = 0;

  if (a > b) {
    result = 1;
  }

  if (a < b) {
    result = -1;
  }

  return result;
};

let firstEl = el => (Array.isArray(el) ? el[0] : el);

let sortOperation = (array, st_operation) => {
  if (!st_operation.nosort) {
    // If the operation has its own compare function.
    if (st_operation.compare) {
      return array.sort((a, b) => st_operation.compare(firstEl(a), firstEl(b)));
    }

    return array.sort((a, b) => {
      let aFirst = firstEl(a);
      let bFirst = firstEl(b);

      // If both of the first elements are numbers.
      if (typeof aFirst === 'number' && typeof bFirst === 'number') {
        return aFirst - bFirst;
      }

      // If they are both buffers.
      if (Buffer.isBuffer(aFirst) && Buffer.isBuffer(bFirst)) {
        return strCmp(aFirst.toString('hex'), bFirst.toString('hex'));
      }

      // Otherwise
      return strCmp(aFirst.toString(), bFirst.toString());
    });
  }

  return array;
};

const Types = {};

Types.uint8 = {
  fromByteBuffer(b) {
    return b.readUint8();
  },
  appendByteBuffer(b, object) {
    v.require_range(0, 0xff, object, `uint8 ${object}`);
    b.writeUint8(object);
  },
  fromObject(object) {
    v.require_range(0, 0xff, object, `uint8 ${object}`);
    return object;
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return 0;
    }

    v.require_range(0, 0xff, object, `uint8 ${object}`);
    return parseInt(object, 10);
  }
};

Types.uint16 = {
  fromByteBuffer(b) {
    return b.readUint16();
  },
  appendByteBuffer(b, object) {
    v.require_range(0, 0xffff, object, `uint16 ${object}`);
    b.writeUint16(object);
  },
  fromObject(object) {
    v.require_range(0, 0xffff, object, `uint16 ${object}`);
    return object;
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return 0;
    }

    v.require_range(0, 0xffff, object, `uint16 ${object}`);
    return parseInt(object, 10);
  }
};

Types.uint32 = {
  fromByteBuffer(b) {
    return b.readUint32();
  },
  appendByteBuffer(b, object) {
    v.require_range(0, 0xffffffff, object, `uint32 ${object}`);
    b.writeUint32(object);
  },
  fromObject(object) {
    v.require_range(0, 0xffffffff, object, `uint32 ${object}`);
    return object;
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return 0;
    }

    v.require_range(0, 0xffffffff, object, `uint32 ${object}`);
    return parseInt(object, 10);
  }
};

Types.varint32 = {
  fromByteBuffer(b) {
    return b.readVarint32();
  },
  appendByteBuffer(b, object) {
    v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, `uint32 ${object}`);
    b.writeVarint32(object);
  },
  fromObject(object) {
    v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, `uint32 ${object}`);
    return object;
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return 0;
    }

    v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, `uint32 ${object}`);
    return parseInt(object, 10);
  }
};

Types.int64 = {
  fromByteBuffer(b) {
    return b.readInt64();
  },
  appendByteBuffer(b, object) {
    v.required(object);
    b.writeInt64(v.to_long(object));
  },
  fromObject(object) {
    v.required(object);
    return v.to_long(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return '0';
    }

    v.required(object);
    return v.to_long(object).toString();
  }
};

Types.uint64 = {
  fromByteBuffer(b) {
    return b.readUint64();
  },
  appendByteBuffer(b, object) {
    b.writeUint64(v.to_ulong(v.unsigned(object)));
  },
  fromObject(object) {
    return v.to_ulong(v.unsigned(object));
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return '0';
    }

    return v.to_ulong(object).toString();
  }
};

Types.string = {
  fromByteBuffer(b) {
    let b_copy;
    let len = b.readVarint32();
    b_copy = b.copy(b.offset, b.offset + len);
    b.skip(len);
    return Buffer.from(b_copy.toBinary(), 'binary');
  },
  appendByteBuffer(b, object) {
    v.required(object);
    b.writeVarint32(object.length);
    b.append(object.toString('binary'), 'binary');
  },
  fromObject(object) {
    v.required(object);
    return Buffer.from(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return '';
    }

    return object.toString();
  }
};

Types.bytes = (size) => {
  let bytes = {
    fromByteBuffer(b) {
      if (size === undefined) {
        let b_copy;
        let len = b.readVarint32();
        b_copy = b.copy(b.offset, b.offset + len);
        b.skip(len);
        return Buffer.from(b_copy.toBinary(), 'binary');
      }

      let b_copy = b.copy(b.offset, b.offset + size);
      b.skip(size);
      return Buffer.from(b_copy.toBinary(), 'binary');
    },
    appendByteBuffer(b, object) {
      v.required(object);

      if (typeof object === 'string') {
        object = Buffer.from(object, 'hex');
      }

      if (size === undefined) {
        b.writeVarint32(object.length);
      }

      b.append(object.toString('binary'), 'binary');
    },
    fromObject(object) {
      v.required(object);

      if (Buffer.isBuffer(object)) {
        return object;
      }

      return Buffer.from(object, 'hex');
    },
    toObject(object, debug = {}) {
      if (debug.use_default && object === undefined) {
        return new Array(size).join('00');
      }

      v.required(object);
      return object.toString('hex');
    }
  };

  return bytes;
};

Types.bool = {
  fromByteBuffer(b) {
    return b.readUint8() === 1;
  },
  appendByteBuffer(b, object) {
    // supports boolean or integer
    b.writeUint8(JSON.parse(object) ? 1 : 0);
  },
  fromObject(object) {
    return !!JSON.parse(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return false;
    }

    return !!JSON.parse(object);
  }
};

Types.void = {
  fromByteBuffer() {
    throw new Error('(void) undefined type');
  },
  appendByteBuffer() {
    throw new Error('(void) undefined type');
  },
  fromObject() {
    throw new Error('(void) undefined type');
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return undefined;
    }

    throw new Error('(void) undefined type');
  }
};

Types.array = (st_operation) => {
  let array = {
    fromByteBuffer(b) {
      let size = b.readVarint32();

      if (HEX_DUMP) {
        console.log(`varint32 size = ${size.toString(16)}`);
      }

      let result = [];

      for (let i = 0; size > 0 ? i < size : i > size; size > 0 ? i++ : i++) {
        result.push(st_operation.fromByteBuffer(b));
      }

      return sortOperation(result, st_operation);
    },
    appendByteBuffer(b, object) {
      v.required(object);
      object = sortOperation(object, st_operation);
      b.writeVarint32(object.length);

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        st_operation.appendByteBuffer(b, o);
      }
    },
    fromObject(object) {
      v.required(object);
      object = sortOperation(object, st_operation);
      let result = [];

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        result.push(st_operation.fromObject(o));
      }

      return result;
    },
    toObject(object, debug = {}) {
      if (debug.use_default && object === undefined) {
        return [st_operation.toObject(object, debug)];
      }

      v.required(object);
      object = sortOperation(object, st_operation);

      let result = [];

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        result.push(st_operation.toObject(o, debug));
      }

      return result;
    }
  };

  return array;
};

Types.time_point_sec = {
  fromByteBuffer(b) {
    return b.readUint32();
  },
  appendByteBuffer(b, object) {
    if (typeof object !== 'number') {
      object = Types.time_point_sec.fromObject(object);
    }

    b.writeUint32(object);
  },
  fromObject(object) {
    v.required(object);

    if (typeof object === 'number') {
      return object;
    }

    if (object.getTime) {
      return Math.floor(object.getTime() / 1000);
    }

    if (typeof object !== 'string') {
      throw new Error(`Unknown date type: ${object}`);
    }

    // if(typeof object === "string" && !/Z$/.test(object))
    //     object = object + "Z"

    return Math.floor(new Date(object).getTime() / 1000);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return new Date(0).toISOString().split('.')[0];
    }

    v.required(object);

    if (typeof object === 'string') {
      return object;
    }

    if (object.getTime) {
      return object.toISOString().split('.')[0];
    }

    let int = parseInt(object, 10);
    v.require_range(0, 0xffffffff, int, `uint32 ${object}`);
    return new Date(int * 1000).toISOString().split('.')[0];
  }
};

Types.set = (st_operation) => {
  let set_object = {
    validate(array) {
      let dup_map = {};

      for (let i = 0, len = array.length; i < len; i++) {
        let o = array[i];
        let ref = typeof o;

        if (['string', 'number'].indexOf(ref) >= 0) {
          if (dup_map[o] !== undefined) {
            throw new Error('duplicate (set)');
          }

          dup_map[o] = true;
        }
      }

      return sortOperation(array, st_operation);
    },
    fromByteBuffer(b) {
      let size = b.readVarint32();

      if (HEX_DUMP) {
        console.log(`varint32 size = ${size.toString(16)}`);
      }

      return this.validate(
        (() => {
          let result = [];

          for (let i = 0; size > 0 ? i < size : i > size; size > 0 ? i++ : i++) {
            result.push(st_operation.fromByteBuffer(b));
          }

          return result;
        })()
      );
    },
    appendByteBuffer(b, object) {
      if (!object) {
        object = [];
      }

      b.writeVarint32(object.length);
      let iterable = this.validate(object);

      for (let i = 0, len = iterable.length; i < len; i++) {
        let o = iterable[i];
        st_operation.appendByteBuffer(b, o);
      }
    },
    fromObject(object) {
      if (!object) {
        object = [];
      }

      return this.validate(
        (() => {
          let result = [];

          for (let i = 0, len = object.length; i < len; i++) {
            let o = object[i];
            result.push(st_operation.fromObject(o));
          }

          return result;
        })()
      );
    },
    toObject(object, debug = {}) {
      if (debug.use_default && object === undefined) {
        return [st_operation.toObject(object, debug)];
      }

      if (!object) {
        object = [];
      }

      let result = [];

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        result.push(st_operation.toObject(o, debug));
      }

      return this.validate(result);
    }
  };

  return set_object;
};

Types.fixed_array = (count, st_operation) => {
  let fixed_array = {
    fromByteBuffer(b) {
      let results = [];

      for (let i = 0, ref = count; i < ref; i++) {
        results.push(st_operation.fromByteBuffer(b));
      }

      return sortOperation(results, st_operation);
    },
    appendByteBuffer(b, object) {
      if (count !== 0) {
        v.required(object);
        object = sortOperation(object, st_operation);
      }

      for (let i = 0, ref = count; i < ref; i++) {
        st_operation.appendByteBuffer(b, object[i]);
      }
    },
    fromObject(object) {
      if (count !== 0) {
        v.required(object);
      }

      let results = [];

      for (let i = 0, ref = count; i < ref; i++) {
        results.push(st_operation.fromObject(object[i]));
      }

      return results;
    },
    toObject(object, debug) {
      if (debug == null) {
        debug = {};
      }

      let results;

      if (debug.use_default && object === undefined) {
        results = [];

        for (let i = 0, ref = count; i < ref; i++) {
          results.push(st_operation.toObject(undefined, debug));
        }

        return results;
      }

      if (count !== 0) {
        v.required(object);
      }

      results = [];

      for (let i = 0, ref = count; i < ref; i++) {
        results.push(st_operation.toObject(object[i], debug));
      }

      return results;
    }
  };

  return fixed_array;
};

/* Supports instance numbers (11) or object types (1.2.11).  Object type
Validation is enforced when an object type is used. */
Types.id_type = (reserved_spaces, object_type) => {
  v.required(reserved_spaces, 'reserved_spaces');
  v.required(object_type, 'object_type');

  let id_type_object = {
    fromByteBuffer(b) {
      return b.readVarint32();
    },
    appendByteBuffer(b, object) {
      v.required(object);

      if (object.resolve !== undefined) {
        object = object.resolve;
      }

      // convert 1.2.n into just n
      if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
        object = v.get_instance(reserved_spaces, object_type, object);
      }

      b.writeVarint32(v.to_number(object));
    },
    fromObject(object) {
      v.required(object);

      if (object.resolve !== undefined) {
        object = object.resolve;
      }

      if (v.is_digits(object)) {
        return v.to_number(object);
      }

      return v.get_instance(reserved_spaces, object_type, object);
    },
    toObject(object, debug = {}) {
      let object_type_id = ChainTypes.object_type[object_type];

      if (debug.use_default && object === undefined) {
        return `${reserved_spaces}.${object_type_id}.0`;
      }

      v.required(object);

      if (object.resolve !== undefined) {
        object = object.resolve;
      }

      if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
        object = v.get_instance(reserved_spaces, object_type, object);
      }

      return `${reserved_spaces}.${object_type_id}.${object}`;
    }
  };

  return id_type_object;
};

Types.protocol_id_type = (name) => {
  v.required(name, 'name');
  return Types.id_type(ChainTypes.reserved_spaces.protocol_ids, name);
};

Types.implementation_id_type = (name) => {
  let result = Types.id_type(ChainTypes.reserved_spaces.implementation_ids, name);
  return result;
};

Types.object_id_type = {
  fromByteBuffer(b) {
    return ObjectId.fromByteBuffer(b);
  },
  appendByteBuffer(b, object) {
    v.required(object);

    if (object.resolve !== undefined) {
      object = object.resolve;
    }

    object = ObjectId.fromString(object);
    object.appendByteBuffer(b);
  },
  fromObject(object) {
    v.required(object);

    if (object.resolve !== undefined) {
      object = object.resolve;
    }

    return ObjectId.fromString(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return '0.0.0';
    }

    v.required(object);

    if (object.resolve !== undefined) {
      object = object.resolve;
    }

    object = ObjectId.fromString(object);
    return object.toString();
  }
};

Types.vote_id = {
  TYPE: 0x000000ff,
  ID: 0xffffff00,
  fromByteBuffer(b) {
    let value = b.readUint32();
    return {
      type: value & this.TYPE, // eslint-disable-line
      id: value & this.ID // eslint-disable-line
    };
  },
  appendByteBuffer(b, object) {
    v.required(object);

    if (object === 'string') {
      object = Types.vote_id.fromObject(object);
    }

    let value = (object.id << 8) | object.type; // eslint-disable-line
    b.writeUint32(value);
  },
  fromObject(object) {
    v.required(object, '(type vote_id)');

    if (typeof object === 'object') {
      v.required(object.type, 'type');
      v.required(object.id, 'id');
      return object;
    }

    v.require_test(/^[0-9]+:[0-9]+$/, object, `vote_id format ${object}`);
    let [type, id] = object.split(':');
    v.require_range(0, 0xff, type, `vote type ${object}`);
    v.require_range(0, 0xffffff, id, `vote id ${object}`);
    return {type, id};
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return '0:0';
    }

    v.required(object);

    if (typeof object === 'string') {
      object = Types.vote_id.fromObject(object);
    }

    return `${object.type}:${object.id}`;
  },
  compare(a, b) {
    if (typeof a !== 'object') {
      a = Types.vote_id.fromObject(a);
    }

    if (typeof b !== 'object') {
      b = Types.vote_id.fromObject(b);
    }

    return parseInt(a.id, 10) - parseInt(b.id, 10);
  }
};

Types.optional = (st_operation) => {
  v.required(st_operation, 'st_operation');
  return {
    fromByteBuffer(b) {
      if (!(b.readUint8() === 1)) {
        return undefined;
      }

      return st_operation.fromByteBuffer(b);
    },
    appendByteBuffer(b, object) {
      if (object !== null && object !== undefined) {
        b.writeUint8(1);
        st_operation.appendByteBuffer(b, object);
      } else {
        b.writeUint8(0);
      }
    },
    fromObject(object) {
      if (object === undefined) {
        return undefined;
      }

      return st_operation.fromObject(object);
    },
    toObject(object, debug = {}) {
      // toObject is only null save if use_default is true
      let result_object = (() => {
        if (!debug.use_default && object === undefined) {
          return undefined;
        }

        return st_operation.toObject(object, debug);
      })();

      if (debug.annotate) {
        if (typeof result_object === 'object') {
          result_object.__optional = 'parent is optional';
        } else {
          result_object = {__optional: result_object};
        }
      }

      return result_object;
    }
  };
};

Types.static_variant = (_st_operations) => {
  let static_variant = {
    nosort: true,
    st_operations: _st_operations,
    fromByteBuffer(b) {
      let type_id = b.readVarint32();
      let st_operation = this.st_operations[type_id];

      if (HEX_DUMP) {
        console.error(`static_variant id 0x${type_id.toString(16)} (${type_id})`);
      }

      v.required(st_operation, `operation ${type_id}`);
      return [type_id, st_operation.fromByteBuffer(b)];
    },
    appendByteBuffer(b, object) {
      v.required(object);
      let type_id = object[0];
      let st_operation = this.st_operations[type_id];
      v.required(st_operation, `operation ${type_id}`);
      b.writeVarint32(type_id);
      st_operation.appendByteBuffer(b, object[1]);
    },
    fromObject(object) {
      v.required(object);
      let type_id = object[0];
      let st_operation = this.st_operations[type_id];

      v.required(st_operation, `operation ${type_id}`);
      return [type_id, st_operation.fromObject(object[1])];
    },
    toObject(object, debug = {}) {
      if (debug.use_default && object === undefined) {
        return [0, this.st_operations[0].toObject(undefined, debug)];
      }

      v.required(object);
      let type_id = object[0];
      let st_operation = this.st_operations[type_id];
      v.required(st_operation, `operation ${type_id}`);
      return [type_id, st_operation.toObject(object[1], debug)];
    }
  };

  return static_variant;
};

Types.map = (key_st_operation, value_st_operation) => {
  let map_object = {
    validate(array) {
      if (!Array.isArray(array)) {
        throw new Error('expecting array');
      }

      let dup_map = {};

      for (let i = 0, len = array.length; i < len; i++) {
        let o = array[i];
        let ref;

        if (!(o.length === 2)) {
          throw new Error('expecting two elements');
        }

        ref = typeof o[0];

        if (ref && ['number', 'string'].indexOf(ref) >= 0) {
          if (dup_map[o[0]] !== undefined) {
            throw new Error('duplicate (map)');
          }

          dup_map[o[0]] = true;
        }
      }

      return sortOperation(array, key_st_operation);
    },

    fromByteBuffer(b) {
      let result = [];
      let end = b.readVarint32();

      for (let i = 0; end > 0 ? i < end : i > end; end > 0 ? i++ : i++) {
        result.push([key_st_operation.fromByteBuffer(b), value_st_operation.fromByteBuffer(b)]);
      }

      return this.validate(result);
    },

    appendByteBuffer(b, object) {
      this.validate(object);
      b.writeVarint32(object.length);

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        key_st_operation.appendByteBuffer(b, o[0]);
        value_st_operation.appendByteBuffer(b, o[1]);
      }
    },
    fromObject(object) {
      v.required(object);
      let result = [];

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        result.push([key_st_operation.fromObject(o[0]), value_st_operation.fromObject(o[1])]);
      }

      return this.validate(result);
    },
    toObject(object, debug = {}) {
      if (debug.use_default && object === undefined) {
        return [
          [
            key_st_operation.toObject(undefined, debug),
            value_st_operation.toObject(undefined, debug)
          ]
        ];
      }

      v.required(object);
      object = this.validate(object);
      let result = [];

      for (let i = 0, len = object.length; i < len; i++) {
        let o = object[i];
        result.push([
          key_st_operation.toObject(o[0], debug),
          value_st_operation.toObject(o[1], debug)
        ]);
      }

      return result;
    }
  };

  return map_object;
};

Types.public_key = {
  toPublic(object) {
    if (object.resolve !== undefined) {
      object = object.resolve;
    }

    if (object instanceof PublicKey) {
      return object;
    }

    let result = object;

    if (!object) {
      return null;
    }

    if (!object.Q) {
      result = PublicKey.fromStringOrThrow(object);
    }

    return result;
  },
  fromByteBuffer(b) {
    return fp.public_key(b);
  },
  appendByteBuffer(b, object) {
    v.required(object);
    fp.public_key(b, Types.public_key.toPublic(object));
  },
  fromObject(object) {
    v.required(object);

    if (object.Q) {
      return object;
    }

    return Types.public_key.toPublic(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return `${ChainConfig.address_prefix}859gxfnXyUriMgUeThh1fWv3oqcpLFyHa3TfFYC4PK2HqhToVM`;
    }

    v.required(object);
    return object.toString();
  },
  compare(a, b) {
    return strCmp(a.toAddressString(), b.toAddressString());
  }
};

Types.address = {
  _to_address(object) {
    v.required(object);

    if (object.addy) {
      return object;
    }

    return Address.fromString(object);
  },
  fromByteBuffer(b) {
    return new Address(fp.ripemd160(b));
  },
  appendByteBuffer(b, object) {
    fp.ripemd160(b, Types.address._to_address(object).toBuffer());
  },
  fromObject(object) {
    return Types.address._to_address(object);
  },
  toObject(object, debug = {}) {
    if (debug.use_default && object === undefined) {
      return `${ChainConfig.address_prefix}664KmHxSuQyDsfwo4WEJvWpzg1QKdg67S`;
    }

    return Types.address._to_address(object).toString();
  },
  compare(a, b) {
    return strCmp(a.toString(), b.toString());
  }
};

Types.variant = {
  fromByteBuffer(b) {
    let type = b.readUint8();

    switch (type) {
      case 0:
        return null;
      case 1:
        return Types.int64.fromByteBuffer(b);
      case 2:
        return Types.uint64.fromByteBuffer(b);
      case 3:
        return b.readDouble();
      case 4:
        return Types.bool.fromByteBuffer(b);
      case 5:
        return Types.string.fromByteBuffer(b);
      case 6:
        return Types.array(Types.variant).fromByteBuffer(b);
      case 7:
      default:
        return Types.variant_object.fromByteBuffer(b);
    }
  },

  appendByteBuffer(b, object) {
    if (typeof object === 'number') {
      if (Number.isInteger(object)) {
        if (object >= 0) {
          b.writeUint8(2);
          Types.uint64.appendByteBuffer(b, object);
        } else {
          b.writeUint8(1);
          Types.int64.appendByteBuffer(b, object);
        }
      } else {
        b.writeUint8(3);
        b.writeDouble(Number.parseFloat(object));
      }
    } else if (typeof object === 'boolean') {
      b.writeUint8(4);
      Types.bool.appendByteBuffer(b, object);
    } else if (typeof object === 'string') {
      b.writeUint8(5);
      Types.string.appendByteBuffer(b, object);
    } else if (Array.isArray(object)) {
      b.writeUint8(6);
      Types.array(Types.variant).appendByteBuffer(b, object);
    } else {
      b.writeUint8(7);
      Types.variant_object.appendByteBuffer(b, object);
    }
  },

  fromObject(object) {
    return JSON.parse(object);
  },

  toObject(object) {
    return JSON.parse(object);
  }
};

Types.variant_object = {
  fromByteBuffer(b) {
    let count = b.readVarint32();
    let result = {};

    for (let i = 0; i < count; ++i) {
      let key = Types.string.fromByteBuffer(b);
      result[key] = Types.variant.fromByteBuffer(b);
    }

    return result;
  },

  appendByteBuffer(b, object) {
    let keys = Object.keys(object);

    b.writeVarint32(keys.length); // number of key/value pairs

    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      Types.string.appendByteBuffer(b, key);
      Types.variant.appendByteBuffer(b, object[key]);
    }
  },
  fromObject(object) {
    let newObject = {};

    let keys = Object.keys(object);

    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      newObject[key] = object[key];
    }

    return newObject;
  },
  toObject(object) {
    let newObject = {};

    let keys = Object.keys(object);

    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      newObject[key] = object[key];
    }

    return newObject;
  }
};

Types.enumeration = (values) => {
  let enumeration = {
    fromByteBuffer(b) {
      return values[b.readVarint32ZigZag()];
    },
    appendByteBuffer(b, object) {
      b.writeVarint32ZigZag(values.indexOf(object));
    },
    fromObject(object) {
      return object;
    },
    toObject(object) {
      return object;
    }
  };

  return enumeration;
};

Types.sha256 = Types.bytes(32);

export default Types;
