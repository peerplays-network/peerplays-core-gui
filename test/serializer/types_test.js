import {Long} from 'bytebuffer';
import assert from 'assert';
import {ChainConfig} from 'peerplaysjs-ws';
import Convert from '../../lib/serializer/src/convert';

import p from '../../lib/serializer/src/precision';
import th from './test_helper';

import {types} from '../../lib';

function overflow(f) {
  return th.error('overflow', f);
}

describe('types', () => {
  it('vote_id', () => {
    let toHex = (id) => {
      let vote = types.vote_id.fromObject(id);
      return Convert(types.vote_id).toHex(vote);
    };

    assert.equal('ff000000', toHex('255:0'));
    assert.equal('00ffffff', toHex(`0:${0xffffff}`));

    let out_of_range = (id) => {
      try {
        toHex(id);
        return assert(false, 'should have been out of range');
      } catch (e) {
        return assert(e.message.indexOf('out of range') !== -1);
      }
    };

    out_of_range(`0:${0xffffff + 1}`);
    out_of_range('256:0');
  });

  it('set sort', () => {
    let bool_set = types.set(types.bool);
    // Note, 1,0 sorts to 0,1
    assert.equal('020001', Convert(bool_set).toHex([1, 0]));
    th.error('duplicate (set)', () => Convert(bool_set).toHex([1, 1]));
  });

  it('string sort', () => {
    let setType = types.set(types.string);
    let set = setType.fromObject(['a', 'z', 'm']);
    let setObj = setType.toObject(set);
    assert.deepEqual(['a', 'm', 'z'], setObj, 'not sorted');
  });

  it('map sort', () => {
    let bool_map = types.map(types.bool, types.bool);
    // 1,1 0,0   sorts to   0,0  1,1
    assert.equal('0200000101', Convert(bool_map).toHex([[1, 1], [0, 0]]));
    th.error('duplicate (map)', () => Convert(bool_map).toHex([[1, 1], [1, 1]]));
  });

  before(() => {
    ChainConfig.setPrefix('TEST');
  });

  it('public_key sort', () => {
    let mapType = types.map(types.public_key, types.uint16);
    let map = mapType.fromObject([
      // not sorted
      ['TEST6FHYdi17RhcUXJZr5fxZm1wvVCpXPekiHeAEwRHSEBmiR3yceK', 0],
      ['TEST5YdgWfAejDdSuq55xfguqFTtbRKLi2Jcz1YtTsCzYgdUYXs92c', 0],
      ['TEST7AGnzGCAGVfFnyvPziN67mfuHx9rx89r2zVoRGW1Aawim1f3Qt', 0]
    ]);
    let mapObject = mapType.toObject(map);
    assert.deepEqual(mapObject, [
      // sorted (witness_node sorts assending by "address" (not pubkey))
      ['TEST7AGnzGCAGVfFnyvPziN67mfuHx9rx89r2zVoRGW1Aawim1f3Qt', 0],
      ['TEST5YdgWfAejDdSuq55xfguqFTtbRKLi2Jcz1YtTsCzYgdUYXs92c', 0],
      ['TEST6FHYdi17RhcUXJZr5fxZm1wvVCpXPekiHeAEwRHSEBmiR3yceK', 0]
    ]);
  });

  it('type_id sort', () => {
    // map (protocol_id_type "account"), (uint16)
    let t = types.map(types.protocol_id_type('account'), types.uint16);
    assert.deepEqual(t.fromObject([[1, 1], [0, 0]]), [[0, 0], [1, 1]], 'did not sort');
    assert.deepEqual(t.fromObject([[0, 0], [1, 1]]), [[0, 0], [1, 1]], 'did not sort');
  });

  it('precision number strings', () => {
    let check = (input_string, precision, output_string) => {
      let result = assert.equal(
        output_string,
        p._internal.decimal_precision_string(input_string, precision)
      );
      return result;
    };

    check(
      '12345678901234567890123456789012345678901234567890.12345',
      5,
      '1234567890123456789012345678901234567890123456789012345'
    );
    check('', 0, '0');
    check('0', 0, '0');
    check('-0', 0, '0');
    check('-00', 0, '0');
    check('-0.0', 0, '0');
    check('-', 0, '0');
    check('1', 0, '1');
    check('11', 0, '11');

    overflow(() => check('.1', 0, ''));
    overflow(() => check('-.1', 0, ''));
    overflow(() => check('0.1', 0, ''));
    overflow(() => check('1.1', 0, ''));
    overflow(() => check('1.11', 1, ''));

    check('', 1, '00');
    check('1', 1, '10');
    check('1.1', 1, '11');
    check('-1', 1, '-10');
    check('-1.1', 1, '-11');
  });

  return it('precision number long', () => {
    let _precision = 0;
    assert.equal(
      Long.MAX_VALUE.toString(),
      p.to_bigint64(Long.MAX_VALUE.toString(), _precision).toString(),
      'to_bigint64 MAX_VALUE mismatch'
    );

    // Long.MAX_VALUE.toString() == 9223372036854775807
    // Long.MAX_VALUE.toString() +1 9223372036854775808
    overflow(() => p.to_bigint64('9223372036854775808', _precision));

    assert.equal('0', p.to_string64(Long.ZERO, 0));
    assert.equal('00', p.to_string64(Long.ZERO, 1));

    _precision = 1;
    overflow(() => p.to_bigint64('92233720368547758075', _precision));
  });
});
