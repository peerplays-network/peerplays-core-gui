let assert = require("assert");
let { Signature, PublicKey, hash } = require("../../ecc");
let { Serializer, types } = require("../../serializer");
let {Apis, ChainConfig} = require('peerplaysjs-ws');

let ChainTypes = require('./ChainTypes');
let head_block_time_string;
let ByteBuffer = require('bytebuffer');
let secureRandom = require("secure-random");

let {
    //id_type,
    //varint32,
    uint8, uint16, uint32, int64, uint64,
    string, bytes, bool, array, fixed_array,
    protocol_id_type, object_id_type, vote_id,
    future_extensions,
    static_variant, map, set,
    public_key, address,
    time_point_sec,
    optional,
    variant,
    variant_object,
    enumeration, sha256
} = types;


var rock_paper_scissors_gesture = enumeration([
   "rock",
   "paper",
   "scissors",
   "spock",
   "lizard"]);

var rock_paper_scissors_throw = new Serializer(
    "rock_paper_scissors_throw",
    {nonce1: uint64,
    nonce2: uint64,
    gesture: rock_paper_scissors_gesture});

var rock_paper_scissors_throw_commit = new Serializer(
    "rock_paper_scissors_throw_commit",
    {nonce1: uint64,
     throw_hash: sha256});

var rock_paper_scissors_throw_reveal = new Serializer(
    "rock_paper_scissors_throw_reveal",
    {nonce2: uint64,
    gesture: rock_paper_scissors_gesture});

class GameMoves {
    createCommitAndRevealMoveOperations(move_type) {
        let nonce1 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();
        let nonce2 = ByteBuffer.wrap(secureRandom.randomArray(8)).readUint64();

        let throw_object = rock_paper_scissors_throw.fromObject({ 
            nonce1: nonce1,
            nonce2: nonce2, 
            gesture: move_type 
        });
        let throw_object_reconstructed = rock_paper_scissors_throw.toObject(throw_object);
        //console.log("Nonce1: %o, Nonce2: %o", nonce1, nonce2);
        //console.log("As object: %O, as JS: %O", throw_object, throw_object_reconstructed);
        let throw_buffer = rock_paper_scissors_throw.toBuffer(throw_object);
        //console.log("As hex: %O", rock_paper_scissors_throw.toHex(throw_object));
        let throw_hash = hash.sha256(throw_buffer);
        //console.log("Hash is : %O", throw_hash);

        let commit_move_operation_object = rock_paper_scissors_throw_commit.fromObject({
            nonce1: nonce1,
            throw_hash: throw_hash
        });
        let reveal_move_operation_object = rock_paper_scissors_throw_reveal.fromObject({
            nonce2: nonce2,
            gesture: move_type
        });

        //console.log("Commit hex is %O, reveal hex is %O", rock_paper_scissors_throw_commit.toHex(commit_move_operation_object), rock_paper_scissors_throw_reveal.toHex(reveal_move_operation_object));

        let commit_move_operation = rock_paper_scissors_throw_commit.toObject(commit_move_operation_object);
        let reveal_move_operation = rock_paper_scissors_throw_reveal.toObject(reveal_move_operation_object);
        //console.log("As JS, they are %O, %O", commit_move_operation, reveal_move_operation);


        return [commit_move_operation, reveal_move_operation];
    }
}

module.exports = GameMoves;
