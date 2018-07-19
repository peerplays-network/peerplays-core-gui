import {hash} from '../../ecc';
import {Serializer, types} from '../../serializer';

let ByteBuffer = require('bytebuffer');
let secureRandom = require('secure-random');

let {
  uint64,
  enumeration,
  sha256
} = types;

let rock_paper_scissors_gesture = enumeration(['rock', 'paper', 'scissors', 'spock', 'lizard']);

let rock_paper_scissors_throw = new Serializer('rock_paper_scissors_throw', {
  nonce1: uint64,
  nonce2: uint64,
  gesture: rock_paper_scissors_gesture
});

let rock_paper_scissors_throw_commit = new Serializer('rock_paper_scissors_throw_commit', {
  nonce1: uint64,
  throw_hash: sha256
});

let rock_paper_scissors_throw_reveal = new Serializer('rock_paper_scissors_throw_reveal', {
  nonce2: uint64,
  gesture: rock_paper_scissors_gesture
});

class GameMoves {
  static createCommitAndRevealMoveOperations(move_type) {
    let nonce1 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();
    let nonce2 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();

    let throw_object = rock_paper_scissors_throw.fromObject({
      nonce1,
      nonce2,
      gesture: move_type
    });

    let throw_buffer = rock_paper_scissors_throw.toBuffer(throw_object);
    let throw_hash = hash.sha256(throw_buffer);

    let commit_move_operation_object = rock_paper_scissors_throw_commit.fromObject({
      nonce1,
      throw_hash
    });
    let reveal_move_operation_object = rock_paper_scissors_throw_reveal.fromObject({
      nonce2,
      gesture: move_type
    });

    let commit_move_operation = rock_paper_scissors_throw_commit.toObject(
      commit_move_operation_object
    );
    let reveal_move_operation = rock_paper_scissors_throw_reveal.toObject(
      reveal_move_operation_object
    );

    return [commit_move_operation, reveal_move_operation];
  }
}

module.exports = GameMoves;
