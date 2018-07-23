import assert from 'assert';
import * as ops from '../../lib/serializer/src/operations';

function template(op) {
  assert(op.toObject({}, {use_default: true}));
  assert(op.toObject({}, {use_default: true, annotate: true}));

  // sample json
  let obj = op.toObject({}, {use_default: true, annotate: false});
  console.log(' ', op.operation_name, '\t', JSON.stringify(obj), '\n');
}

describe('operation test', () => {  
  it('templates', () => {
    let keys = Object.keys(ops);

    for (let i = 0, len = keys.length; i < len; i++) {
      let op = keys[i];

      switch (op) {
        case '__esModule':
        case 'operation':
          return;
      }

      template(ops[op]);
    }
  });
});
