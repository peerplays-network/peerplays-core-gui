'use strict';

exports.__esModule = true;

var _ecc = require('../../ecc');

var _serializer = require('../../serializer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ByteBuffer = require('bytebuffer');
var secureRandom = require('secure-random');

var uint64 = _serializer.types.uint64,
    enumeration = _serializer.types.enumeration,
    sha256 = _serializer.types.sha256;


var rock_paper_scissors_gesture = enumeration(['rock', 'paper', 'scissors', 'spock', 'lizard']);

var rock_paper_scissors_throw = new _serializer.Serializer('rock_paper_scissors_throw', {
  nonce1: uint64,
  nonce2: uint64,
  gesture: rock_paper_scissors_gesture
});

var rock_paper_scissors_throw_commit = new _serializer.Serializer('rock_paper_scissors_throw_commit', {
  nonce1: uint64,
  throw_hash: sha256
});

var rock_paper_scissors_throw_reveal = new _serializer.Serializer('rock_paper_scissors_throw_reveal', {
  nonce2: uint64,
  gesture: rock_paper_scissors_gesture
});

var GameMoves = function () {
  function GameMoves() {
    _classCallCheck(this, GameMoves);
  }

  GameMoves.createCommitAndRevealMoveOperations = function createCommitAndRevealMoveOperations(move_type) {
    var nonce1 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();
    var nonce2 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();

    var throw_object = rock_paper_scissors_throw.fromObject({
      nonce1: nonce1,
      nonce2: nonce2,
      gesture: move_type
    });

    var throw_buffer = rock_paper_scissors_throw.toBuffer(throw_object);
    var throw_hash = _ecc.hash.sha256(throw_buffer);

    var commit_move_operation_object = rock_paper_scissors_throw_commit.fromObject({
      nonce1: nonce1,
      throw_hash: throw_hash
    });
    var reveal_move_operation_object = rock_paper_scissors_throw_reveal.fromObject({
      nonce2: nonce2,
      gesture: move_type
    });

    var commit_move_operation = rock_paper_scissors_throw_commit.toObject(commit_move_operation_object);
    var reveal_move_operation = rock_paper_scissors_throw_reveal.toObject(reveal_move_operation_object);

    return [commit_move_operation, reveal_move_operation];
  };

  return GameMoves;
}();

exports.default = GameMoves;
module.exports = exports['default'];