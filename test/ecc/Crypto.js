import assert from 'assert';
import {
  Aes, PrivateKey, PublicKey, Signature, hash, key
} from '../../lib';

import dictionary from './dictionary';

function min_time_elapsed(f) {
  let start_t = Date.now();
  let ret = f();
  let elapsed = Date.now() - start_t;
  assert.equal(
    // repeat operations may take less time
    elapsed >= 250 * 0.8,
    true,
    `minimum time requirement was not met, instead only ${elapsed / 1000.0} elapsed`
  );
  return ret;
}

describe('ECC', () => {
  describe('Crypto', () => {
    let encrypted_key = '37fd6a251d262ec4c25343016a024a3aec543b7a43a208bf66bc80640dff'
      + '8ac8d52ae4ad7500d067c90f26189f9ee6050a13c087d430d24b88e713f1'
      + '5d32cbd59e61b0e69c75da93f43aabb11039d06f';

    let decrypted_key = 'ab0cb9a14ecaa3078bfee11ca0420ea2'
      + '3f5d49d7a7c97f7f45c3a520106491f8' // 64 hex digits
      + '00000000000000000000000000000000000000000000000000000000'
      + '00000000';

    it('Decrypt', () => {
      let aes = Aes.fromSeed('Password01');
      let d = aes.decryptHex(encrypted_key);
      assert.equal(decrypted_key, d, 'decrypted key does not match');
    });
    it('Encrypt', () => {
      let aes = Aes.fromSeed('Password01');
      let d = aes.encryptHex(decrypted_key);
      assert.equal(encrypted_key, d, 'encrypted key does not match');
    });
    it('generate private key from seed', () => {
      let private_key = PrivateKey.fromSeed('1');
      assert.equal(
        private_key.toPublicKey().toString(),
        'GPH8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA',
        'private key does not match'
      );
    });
    it('sign', () => {
      let private_key = PrivateKey.fromSeed('1');
      return (() => {
        let result = [];

        for (let i = 0; i < 10; i++) {
          result.push(Signature.signBuffer(Buffer.alloc(i), private_key));
        }

        return result;
      })();
    });

    it('binary_encryption', () => {
      let sender = PrivateKey.fromSeed('1');
      let receiver = PrivateKey.fromSeed('2');
      // let S = sender.get_shared_secret(receiver.toPublicKey());
      let nonce = '289662526069530675';
      let ciphertext = Aes.encrypt_with_checksum(
        sender,
        receiver.toPublicKey(),
        nonce,
        Buffer.from('\xff\x00', 'binary')
      );
      // console.log '... ciphertext',ciphertext
      let plaintext = Aes.decrypt_with_checksum(receiver, sender.toPublicKey(), nonce, ciphertext);
      // console.log '... plaintext',plaintext.toString()
      assert.equal('ff00', plaintext.toString('hex'));
    });
    // time-based, probably want to keep these last
    it('key_checksum', () => min_time_elapsed(() => {
      let key_checksum = key.aes_checksum('password').checksum;
      assert.equal(true, key_checksum.length > 4 + 4 + 2, 'key_checksum too short');
      assert.equal(3, key_checksum.split(',').length);
    }));

    it('key_checksum with aes_private', () => min_time_elapsed(() => {
      let aes_checksum = key.aes_checksum('password');
      let aes_private = aes_checksum.aes_private;
      let key_checksum = aes_checksum.checksum;
      assert(aes_private !== null);
      assert(typeof aes_private.decrypt === 'function');
      assert.equal(true, key_checksum.length > 4 + 4 + 2, 'key_checksum too short');
      assert.equal(3, key_checksum.split(',').length);
    }));
    // DEBUG console.log('... key_checksum',key_checksum)

    it('wrong password', () => {
      let key_checksum = min_time_elapsed(() => key.aes_checksum('password').checksum);
      // DEBUG console.log('... key_checksum',key_checksum)
      assert.throws(
        () => min_time_elapsed(() => {
          key.aes_private('bad password', key_checksum);
        }),
        'wrong password'
      );
    });

    it('password aes_private', () => {
      let key_checksum = min_time_elapsed(() => key.aes_checksum('password').checksum);

      let password_aes = min_time_elapsed(() => key.aes_private('password', key_checksum));

      // DEBUG console.log('... password_aes',password_aes)
      assert(password_aes !== null);
    });
  });

  describe('Derivation', () => {
    let one_time_private = PrivateKey.fromHex(
      '8fdfdde486f696fd7c6313325e14d3ff0c34b6e2c390d1944cbfe150f4457168'
    );
    let to_public = PublicKey.fromStringOrThrow(
      'GPH7vbxtK1WaZqXsiCHPcjVFBewVj8HFRd5Z5XZDpN6Pvb2dZcMqK'
    );
    let secret = one_time_private.get_shared_secret(to_public);
    let child = hash.sha256(secret);

    // Check everything above with `wdump((child));` from the witness_node:
    assert.equal(
      child.toString('hex'),
      '1f296fa48172d9af63ef3fb6da8e369e6cc33c1fb7c164207a3549b39e8ef698'
    );

    let nonce = hash.sha256(one_time_private.toBuffer());
    assert.equal(
      nonce.toString('hex'),
      '462f6c19ece033b5a3dba09f1e1d7935a5302e4d1eac0a84489cdc8339233fbf'
    );

    it('child from public', () => {
      assert.equal(
        to_public.child(child).toString(),
        'GPH6XA72XARQCain961PCJnXiKYdEMrndNGago2PV5bcUiVyzJ6iL',
        'derive child public key'
      );
    });

    // child = sha256( one_time_private.get_secret( to_public ))
    it('child from private', () => {
      assert.equal(
        PrivateKey.fromSeed('alice-brain-key')
          .child(child)
          .toPublicKey()
          .toString(),
        'GPH6XA72XARQCain961PCJnXiKYdEMrndNGago2PV5bcUiVyzJ6iL',
        'derive child from private key'
      );
    });

    it('Suggest brainkey', () => {
      let brainKey = key.suggest_brain_key(dictionary.en);
      assert.equal(16, brainKey.split(' ').length);
    });

    // "many keys" works, not really needed
    // it("many keys", function() {
    //
    //     this.timeout(10 * 1000)
    //
    //     for (var i = 0; i < 10; i++) {
    //         let privkey1 = key.get_random_key()
    //         let privkey2 = key.get_random_key()
    //
    //         let secret1 = one_time_private.get_shared_secret( privkey1.toPublicKey() )
    //         let child1 = sha256( secret1 )
    //
    //         let secret2 = privkey2.get_shared_secret( privkey2.toPublicKey() )
    //         let child2 = sha256( secret2 )
    //
    //         it("child from public", ()=> assert.equal(
    //             privkey1.toPublicKey().child(child1).toString(),
    //             privkey2.toPublicKey().child(child2).toString(),
    //             "derive child public key"
    //         ))
    //
    //         it("child from private", ()=> assert.equal(
    //             privkey1.child(child1).toString(),
    //             privkey2.child(child2).toString(),
    //             "derive child private key"
    //         ))
    //     }
    //
    // })
  });
});
