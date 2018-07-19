import assert from 'assert';
import {
  PrivateKey, Address, Serializer, ops, types
} from '../../lib';

let {
  // varint32,
  uint8,
  uint16,
  uint32,
  int64,
  uint64,
  string,
  bytes,
  bool,
  array,
  fixed_array,
  protocol_id_type,
  object_id_type,
  // future_extensions,
  static_variant,
  map,
  set,
  public_key,
  address,
  time_point_sec,
  optional
} = types;

let {asset, account_name_eq_lit_predicate} = ops;

// Must stay in sync with allTypes below.
let AllTypes = new Serializer('all_types', {
  uint8,
  uint16,
  uint32,
  int64,
  uint64,
  string,
  bytes: bytes(1),
  bool,
  array: array(uint8),
  fixed_array: fixed_array(2, uint8),
  protocol_id_type: protocol_id_type('account'),
  object_id_type, // vote_id,

  static_variant: array(static_variant([asset, account_name_eq_lit_predicate])),
  map: map(uint8, uint8),
  set: set(uint8),

  public_key,
  address,

  time_optional: optional(time_point_sec),
  time_point_sec1: time_point_sec,
  time_point_sec2: time_point_sec
});

// Must stay in sync with AllTypes above.
let allTypes = {
  uint8: Math.pow(2, 8) - 1,
  uint16: Math.pow(2, 16) - 1,
  uint32: Math.pow(2, 32) - 1,
  int64: '9223372036854775807',
  uint64: '9223372036854775807',

  string: 'test',
  bytes: 'ff',
  bool: true,
  array: [2, 1],
  fixed_array: [1, 0],
  protocol_id_type: '1.2.2222',
  object_id_type: '1.1.1', // vote_id: "2:1",

  static_variant: [[1, {account_id: '1.2.1', name: 'abc'}], [0, {amount: '1', asset_id: '1.3.0'}]],
  map: [[4, 3], [2, 1]],
  set: [2, 1],

  public_key: PrivateKey.fromSeed('')
    .toPublicKey()
    .toString(),
  address: Address.fromPublic(PrivateKey.fromSeed('').toPublicKey()).toString(),

  time_optional: undefined,
  time_point_sec1: new Date(),
  time_point_sec2: Math.floor(Date.now() / 1000)
};

describe('Serializer', () => {
  describe('all types', () => {
    it('from object', () => {
      assert(AllTypes.fromObject(allTypes), 'serializable');
      assert(AllTypes.fromObject(AllTypes.fromObject(allTypes)), 'non-serializable');
    });

    it('to object', () => {
      assert(AllTypes.toObject(allTypes), 'serializable');
      assert.deepEqual(
        AllTypes.toObject(allTypes),
        AllTypes.toObject(allTypes),
        'serializable (single to)'
      );
      assert.deepEqual(
        AllTypes.toObject(AllTypes.toObject(allTypes)),
        AllTypes.toObject(allTypes),
        'serializable (double to)'
      );
      assert.deepEqual(
        AllTypes.toObject(AllTypes.fromObject(allTypes)),
        AllTypes.toObject(allTypes),
        'non-serializable'
      );
      assert.deepEqual(
        AllTypes.toObject(AllTypes.fromObject(AllTypes.fromObject(allTypes))),
        AllTypes.toObject(allTypes),
        'non-serializable (double from)'
      );
    });

    it('to buffer', () => {
      assert(AllTypes.toBuffer(allTypes), 'serializable');
      assert(AllTypes.toBuffer(AllTypes.fromObject(allTypes)), 'non-serializable');
      assert.equal(
        AllTypes.toBuffer(allTypes).toString('hex'), // serializable
        AllTypes.toBuffer(AllTypes.fromObject(allTypes)).toString('hex'), // non-serializable
        'serializable and non-serializable'
      );
    });

    it('from buffer', () => {
      assert.deepEqual(
        AllTypes.toObject(AllTypes.fromBuffer(AllTypes.toBuffer(allTypes))),
        AllTypes.toObject(allTypes),
        'serializable'
      );
      assert.deepEqual(
        AllTypes.toObject(AllTypes.fromBuffer(AllTypes.toBuffer(AllTypes.fromObject(allTypes)))),
        AllTypes.toObject(allTypes),
        'non-serializable'
      );
    });

    it('template', () => {
      assert(AllTypes.toObject(allTypes, {use_default: true}));
      assert(AllTypes.toObject(allTypes, {annotate: true}));
      assert(AllTypes.toObject({}, {use_default: true}));
      assert(AllTypes.toObject({}, {use_default: true, annotate: true}));
    });

    // keep last
    // it("visual check", function() {
    //     console.log(toObject(fromObject(allTypes)))
    // })
  });
});
