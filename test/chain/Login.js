import assert from 'assert';
import {Login as login, Login as login2} from '../../lib';

let auths = {
  active: [['GPH5Abm5dCdy3hJ1C5ckXkqUH2Me7dXqi9Y7yjn9ACaiSJ9h8r8mL', 1]]
};

describe('AccountLogin', () => {
  afterEach(() => {
    login.setRoles(['active', 'owner', 'memo']);
  });

  describe('Instance', () => {
    it('Instantiates with default roles', () => {
      let roles = login.get('roles');

      assert(roles.length);
      assert(roles[0] === 'active');
      assert(roles[1] === 'owner');
      assert(roles[2] === 'memo');
    });

    it('Is singleton', () => {
      login.setRoles(['singleton']);

      let roles = login2.get('roles');
      assert(roles.length === 1);
      assert(roles[0] === 'singleton');
    });
  });

  describe('Methods', () => {
    it('Set roles', () => {
      login.setRoles(['active']);
      let roles = login.get('roles');

      assert(roles.length === 1);
      assert(roles[0] === 'active');
    });

    it('Requires 12 char password', () => {
      assert.throws(login.generateKeys, Error);
    });

    it('Generate keys with no role input', () => {
      let {privKeys, pubKeys} = login.generateKeys('someaccountname', 'somereallylongpassword');

      assert(Object.keys(privKeys).length === 3);
      assert(Object.keys(pubKeys).length === 3);
    });

    it('Generate keys with role input', () => {
      let {privKeys, pubKeys} = login.generateKeys('someaccountname', 'somereallylongpassword', [
        'active'
      ]);

      assert(privKeys.active);
      assert(Object.keys(privKeys).length === 1);
      assert(Object.keys(pubKeys).length === 1);
    });

    it('Check keys', () => {
      let success = login.checkKeys({
        accountName: 'someaccountname',
        password: 'somereallylongpassword',
        auths
      });

      assert(true, success);
    });
  });
});
