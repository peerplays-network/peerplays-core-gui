'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

var _ChainTypes = require('./ChainTypes');

var _ChainTypes2 = _interopRequireDefault(_ChainTypes);

var _ChainValidation = require('./ChainValidation');

var _ChainValidation2 = _interopRequireDefault(_ChainValidation);

var _EmitterInstance = require('./EmitterInstance');

var _EmitterInstance2 = _interopRequireDefault(_EmitterInstance);

var _ws = require('../../ws');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var object_type = _ChainTypes2.default.object_type,
    impl_object_type = _ChainTypes2.default.impl_object_type;

var emitter = _EmitterInstance2.default.emitter();

var op_history = parseInt(object_type.operation_history, 10);
var limit_order = parseInt(object_type.limit_order, 10);
var call_order = parseInt(object_type.call_order, 10);
var proposal = parseInt(object_type.proposal, 10);
var witness_object_type = parseInt(object_type.witness, 10);
var worker_object_type = parseInt(object_type.worker, 10);
var committee_member_object_type = parseInt(object_type.committee_member, 10);
var account_object_type = parseInt(object_type.account, 10);
var asset_object_type = parseInt(object_type.asset, 10);
var tournament_object_type = parseInt(object_type.tournament, 10);
var tournament_details_object_type = parseInt(object_type.tournament_details, 10);

var order_prefix = '1.' + limit_order + '.';
var call_order_prefix = '1.' + call_order + '.';
var proposal_prefix = '1.' + proposal + '.';
var operation_history_prefix = '1.' + op_history + '.';
var balance_prefix = '2.' + parseInt(impl_object_type.account_balance, 10) + '.';
var account_stats_prefix = '2.' + parseInt(impl_object_type.account_statistics, 10) + '.';
var transaction_prefix = '2.' + parseInt(impl_object_type.transaction, 10) + '.';
var account_transaction_history_prefix = '2.' + parseInt(impl_object_type.account_transaction_history, 10) + '.';
var asset_dynamic_data_prefix = '2.' + parseInt(impl_object_type.asset_dynamic_data, 10) + '.';
var bitasset_data_prefix = '2.' + parseInt(impl_object_type.asset_bitasset_data, 10) + '.';
var block_summary_prefix = '2.' + parseInt(impl_object_type.block_summary, 10) + '.';
var witness_prefix = '1.' + witness_object_type + '.';
var worker_prefix = '1.' + worker_object_type + '.';
var committee_prefix = '1.' + committee_member_object_type + '.';
var asset_prefix = '1.' + asset_object_type + '.';
var account_prefix = '1.' + account_object_type + '.';
var tournament_prefix = '1.' + tournament_object_type + '.';
var tournament_details_prefix = '1.' + tournament_details_object_type + '.';

// count last operations should be stored in memory
var operations_stack_size = 100;
// count last blocks should be stored in memory
var block_stack_size = 20;

var DEBUG = JSON.parse(process.env.npm_config__graphene_chain_chain_debug || false);

/**
 *  @brief maintains a local cache of blockchain state
 *
 *  The ChainStore maintains a local cache of blockchain state and exposes
 *  an API that makes it easy to query objects and receive updates when
 *  objects are available.
 */

var ChainStore = function () {
  function ChainStore() {
    _classCallCheck(this, ChainStore);

    /** tracks everyone who wants to receive updates when the cache changes */
    this.subscribers = new Set();
    this.subscribed = false;
    /*
        * Tracks specific objects such as accounts that can trigger additional
        * fetching that should only happen if we're actually interested in the account
        */
    this.subbed_accounts = new Set();
    this.subbed_witnesses = new Set();
    this.subbed_committee = new Set();

    this.clearCache();
    this.progress = 0;
    // this.chain_time_offset is used to estimate the blockchain time
    this.chain_time_offset = [];
    this.dispatchFrequency = 40;
  }

  /**
   * Clears all cached state.  This should be called any time the network connection is
   * reset.
   */


  ChainStore.prototype.clearCache = function clearCache() {
    this.objects_by_id = _immutable2.default.Map();
    this.accounts_by_name = _immutable2.default.Map();
    this.assets_by_symbol = _immutable2.default.Map();
    this.account_ids_by_key = _immutable2.default.Map();
    this.balance_objects_by_address = _immutable2.default.Map();
    this.get_account_refs_of_keys_calls = _immutable2.default.Set();
    this.event_groups_list_by_sport_id = _immutable2.default.Map();
    this.betting_market_groups_list_by_sport_id = _immutable2.default.Map();
    this.betting_markets_list_by_sport_id = _immutable2.default.Map();
    this.account_history_requests = new Map(); // /< tracks pending history requests
    this.witness_by_account_id = new Map();
    this.witnesses = _immutable2.default.Set();
    this.account_by_witness_id = new Map();
    this.committee_by_account_id = new Map();
    this.objects_by_vote_id = new Map();
    this.fetching_get_full_accounts = new Map();
    this.recent_operations = _immutable2.default.List();
    this.recent_blocks = _immutable2.default.List();
    this.recent_blocks_by_id = _immutable2.default.Map();
    this.last_processed_block = null;
    this.simple_objects_by_id = _immutable2.default.Map();

    clearTimeout(this.timeout);

    // tournament_ids_by_state is a
    //   Map(account => Map(state_string => Set of tournament ids))
    // it maintains a map of tournaments a given account is allowed to participate
    // in (open-registration tournaments or tournaments they are whitelisted for).
    // the null account maps to all tournaments
    // accounts and states will not be tracked until their first access
    this.tournament_ids_by_state = _immutable2.default.Map().set(null, new _immutable2.default.Map());

    // registered_tournaments_details_by_player is a map of
    //   Map(registered_account_id => Set of tournament details objects)
    // it only tracks tournaments which the account has registered to play in
    this.registered_tournament_ids_by_player = _immutable2.default.Map();

    this.last_tournament_id = undefined;

    this.store_initialized = false;
  };

  ChainStore.prototype.resetCache = function resetCache() {
    this.subscribed = false;
    this.subError = null;
    this.clearCache();
    this.head_block_time_string = null;
    this.init().then(function () {
      console.log('resetCache init success');
    }).catch(function (err) {
      console.log('resetCache init error:', err);
    });
  };

  ChainStore.prototype.setDispatchFrequency = function setDispatchFrequency(freq) {
    this.dispatchFrequency = freq;
  };

  ChainStore.prototype.init = function init() {
    var _this = this;

    var reconnectCounter = 0;

    var _init = function _init(resolve, reject) {
      if (_this.subscribed) {
        return resolve();
      }

      var db_api = _ws.Apis.instance().db_api();

      if (!db_api) {
        return reject(new Error('Api not found, please initialize the api instance before calling the ChainStore'));
      }

      return db_api.exec('get_objects', [['2.1.0']]).then(function (optional_objects) {
        for (var i = 0, len = optional_objects.length; i < len; i++) {
          var optional_object = optional_objects[i];

          if (optional_object) {
            _this._updateObject(optional_object, true);

            var head_time = new Date(optional_object.time + '+00:00').getTime();
            _this.head_block_time_string = optional_object.time;
            _this.chain_time_offset.push(new Date().getTime() - ChainStore.timeStringToDate(optional_object.time).getTime());
            var now = new Date().getTime();
            var delta = (now - head_time) / 1000;
            var start = Date.parse('Sep 1, 2015');
            var progress_delta = head_time - start;
            _this.progress = progress_delta / (now - start);

            if (delta < 60) {
              _ws.Apis.instance().db_api().exec('set_subscribe_callback', [_this.onUpdate.bind(_this), true]).then(function () {
                console.log('synced and subscribed, chainstore ready');
                _this.subscribed = true;
                _this.fetchRecentOperations();
                _this.subError = null;
                resolve();
              }).catch(function (error) {
                _this.subscribed = false;
                _this.subError = error;
                reject(error);
                console.log('Error: ', error);
              });
            } else {
              console.log('not yet synced, retrying in 1s');
              _this.subscribed = false;
              reconnectCounter++;

              if (reconnectCounter > 5) {
                _this.subError = new Error('ChainStore sync error, please check your system clock');
                return reject(_this.subError);
              }

              setTimeout(_init.bind(_this, resolve, reject), 1000);
            }
          } else {
            setTimeout(_init.bind(_this, resolve, reject), 1000);
          }
        }
      }).catch(function (error) {
        // in the event of an error clear the pending state for id
        console.log('!!! Chain API error', error);
        _this.objects_by_id = _this.objects_by_id.delete('2.1.0');
        reject(error);
      });
    };

    return _ws.Apis.instance().init_promise.then(function () {
      return new Promise(_init);
    });
  };

  ChainStore.prototype._subTo = function _subTo(type, id) {
    var key = 'subbed_' + type;

    if (!this[key].has(id)) {
      this[key].add(id);
    }
  };

  ChainStore.prototype.unSubFrom = function unSubFrom(type, id) {
    var key = 'subbed_' + type;
    this[key].delete(id);
    this.objects_by_id.delete(id);
  };

  ChainStore.prototype._isSubbedTo = function _isSubbedTo(type, id) {
    var key = 'subbed_' + type;
    return this[key].has(id);
  };

  // / map from account id to objects


  ChainStore.prototype.onUpdate = function onUpdate(updated_objects) {
    var cancelledOrders = [];
    var closedCallOrders = [];

    emitter.emit('heartbeat');

    // updated_objects is the parameter list, it should always be exactly
    // one element long.
    // The single parameter to this callback function is a vector of variants, where
    // each entry indicates one changed object.
    // If the entry is an object id, it means the object has been removed.  If it
    // is an full object, then the object is either newly-created or changed.
    for (var a = 0, len = updated_objects.length; a < len; ++a) {
      for (var i = 0, sub_len = updated_objects[a].length; i < sub_len; ++i) {
        var obj = updated_objects[a][i];

        if (_ChainValidation2.default.is_object_id(obj)) {
          // An entry containing only an object ID means that object was removed
          // console.log("removed obj", obj);
          // Check if the object exists in the ChainStore
          var old_obj = this.objects_by_id.get(obj);

          if (obj.search(order_prefix) === 0) {
            emitter.emit('cancel-order', obj);
            cancelledOrders.push(obj);

            if (!old_obj) {
              return;
            }

            var account = this.objects_by_id.get(old_obj.get('seller'));

            if (account && account.has('orders')) {
              var limit_orders = account.get('orders');

              if (account.get('orders').has(obj)) {
                account = account.set('orders', limit_orders.delete(obj));
                this.objects_by_id = this.objects_by_id.set(account.get('id'), account);
              }
            }
          }

          // Update nested call_order inside account object
          if (obj.search(call_order_prefix) === 0) {
            emitter.emit('close-call', obj);
            closedCallOrders.push(obj);

            if (!old_obj) {
              return;
            }

            var _account = this.objects_by_id.get(old_obj.get('borrower'));

            if (_account && _account.has('call_orders')) {
              var call_orders = _account.get('call_orders');

              if (_account.get('call_orders').has(obj)) {
                _account = _account.set('call_orders', call_orders.delete(obj));
                this.objects_by_id = this.objects_by_id.set(_account.get('id'), _account);
              }
            }
          }

          // Remove the object
          this.objects_by_id = this.objects_by_id.set(obj, null);
        } else {
          this._updateObject(obj);
        }
      }
    }

    // Cancelled limit order(s), emit event for any listeners to update their state
    if (cancelledOrders.length) {
      emitter.emit('cancel-order', cancelledOrders);
    }

    // Closed call order, emit event for any listeners to update their state
    if (closedCallOrders.length) {
      emitter.emit('close-call', closedCallOrders);
    }

    this.notifySubscribers();
  };

  ChainStore.prototype.notifySubscribers = function notifySubscribers() {
    var _this2 = this;

    // Dispatch at most only once every x milliseconds
    if (!this.dispatched) {
      this.dispatched = true;
      this.timeout = setTimeout(function () {
        _this2.dispatched = false;
        _this2.subscribers.forEach(function (callback) {
          return callback();
        });
      }, this.dispatchFrequency);
    }
  };

  /**
   *  Add a callback that will be called anytime any object in the cache is updated
   */


  ChainStore.prototype.subscribe = function subscribe(callback) {
    if (this.subscribers.has(callback)) {
      console.error('Subscribe callback already exists', callback);
    }

    this.subscribers.add(callback);
  };

  /**
   *  Remove a callback that was previously added via subscribe
   */


  ChainStore.prototype.unsubscribe = function unsubscribe(callback) {
    if (!this.subscribers.has(callback)) {
      console.error('Unsubscribe callback does not exists', callback);
    }

    this.subscribers.delete(callback);
  };

  /** Clear an object from the cache to force it to be fetched again. This may
   * be useful if a query failed the first time and the wallet has reason to believe
   * it may succeede the second time.
   */


  ChainStore.prototype.clearObjectCache = function clearObjectCache(id) {
    this.objects_by_id = this.objects_by_id.delete(id);
  };

  /**
   * There are three states an object id could be in:
   *
   * 1. undefined       - returned if a query is pending
   * 3. defined         - return an object
   * 4. null            - query return null
   *
   */


  ChainStore.prototype.getObject = function getObject(id) {
    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!_ChainValidation2.default.is_object_id(id)) {
      throw Error('argument is not an object id: ' + JSON.stringify(id));
    }

    var result = this.objects_by_id.get(id);

    if (result === undefined || force) {
      return this.fetchObject(id, force);
    }

    if (result === true) {
      return undefined;
    }

    return result;
  };

  ChainStore.prototype.getSimpleObjectById = function getSimpleObjectById(id) {
    var _this3 = this;

    return new Promise(function (success, fail) {
      if (!_ChainValidation2.default.is_object_id(id)) {
        return fail(new Error('argument is not an object id: ' + JSON.stringify(id)));
      }

      var result = _this3.simple_objects_by_id.get(id);

      if (result) {
        return success(result);
      }

      _ws.Apis.instance().db_api().exec('get_objects', [[id]]).then(function (objects) {
        var object = objects[0];

        if (!object) {
          return success(null);
        }

        _this3.simple_objects_by_id = _this3.simple_objects_by_id.set(id, object);
        success(object);
      });
    });
  };

  /**
   *  @return undefined if a query is pending
   *  @return null if id_or_symbol has been queired and does not exist
   *  @return object if the id_or_symbol exists
   */


  ChainStore.prototype.getAsset = function getAsset(id_or_symbol) {
    var _this4 = this;

    if (!id_or_symbol) {
      return null;
    }

    if (_ChainValidation2.default.is_object_id(id_or_symbol)) {
      var asset = this.getObject(id_or_symbol);

      if (asset && asset.get('bitasset') && !asset.getIn(['bitasset', 'current_feed'])) {
        return undefined;
      }

      return asset;
    }

    // / TODO: verify id_or_symbol is a valid symbol name

    var asset_id = this.assets_by_symbol.get(id_or_symbol);

    if (_ChainValidation2.default.is_object_id(asset_id)) {
      var _asset = this.getObject(asset_id);

      if (_asset && _asset.get('bitasset') && !_asset.getIn(['bitasset', 'current_feed'])) {
        return undefined;
      }

      return _asset;
    }

    if (asset_id === null) {
      return null;
    }

    if (asset_id === true) {
      return undefined;
    }

    _ws.Apis.instance().db_api().exec('lookup_asset_symbols', [[id_or_symbol]]).then(function (asset_objects) {
      if (asset_objects.length && asset_objects[0]) {
        _this4._updateObject(asset_objects[0], true);
      } else {
        _this4.assets_by_symbol = _this4.assets_by_symbol.set(id_or_symbol, null);
        _this4.notifySubscribers();
      }
    }).catch(function (error) {
      console.log('Error: ', error);
      _this4.assets_by_symbol = _this4.assets_by_symbol.delete(id_or_symbol);
    });

    return undefined;
  };

  /**
   *  @param the public key to find accounts that reference it
   *
   *  @return Set of account ids that reference the given key
   *  @return a empty Set if no items are found
   *  @return undefined if the result is unknown
   *
   *  If this method returns undefined, then it will send a request to
   *  the server for the current set of accounts after which the
   *  server will notify us of any accounts that reference these keys
   */


  ChainStore.prototype.getAccountRefsOfKey = function getAccountRefsOfKey(key) {
    var _this5 = this;

    if (this.get_account_refs_of_keys_calls.has(key)) {
      return this.account_ids_by_key.get(key);
    }

    this.get_account_refs_of_keys_calls = this.get_account_refs_of_keys_calls.add(key);
    _ws.Apis.instance().db_api().exec('get_key_references', [[key]]).then(function (vec_account_id) {
      var refs = _immutable2.default.Set();
      vec_account_id = vec_account_id[0];
      refs = refs.withMutations(function (r) {
        for (var i = 0; i < vec_account_id.length; ++i) {
          r.add(vec_account_id[i]);
        }
      });
      _this5.account_ids_by_key = _this5.account_ids_by_key.set(key, refs);
      _this5.notifySubscribers();
    }, function () {
      _this5.account_ids_by_key = _this5.account_ids_by_key.delete(key);
      _this5.get_account_refs_of_keys_calls = _this5.get_account_refs_of_keys_calls.delete(key);
    });
    return undefined;
  };

  /**
   * @return a Set of balance ids that are claimable with the given address
   * @return undefined if a query is pending and the set is not known at this time
   * @return a empty Set if no items are found
   *
   * If this method returns undefined, then it will send a request to the server for
   * the current state after which it will be subscribed to changes to this set.
   */


  ChainStore.prototype.getBalanceObjects = function getBalanceObjects(address) {
    var _this6 = this;

    var current = this.balance_objects_by_address.get(address);

    if (current === undefined) {
      /** because balance objects are simply part of the genesis state
       * there is no need to worry about having to update them / merge
       * them or index them in updateObject.
       */
      this.balance_objects_by_address = this.balance_objects_by_address.set(address, _immutable2.default.Set());
      _ws.Apis.instance().db_api().exec('get_balance_objects', [[address]]).then(function (balance_objects) {
        var set = new Set();

        for (var i = 0; i < balance_objects.length; ++i) {
          _this6._updateObject(balance_objects[i]);
          set.add(balance_objects[i].id);
        }

        _this6.balance_objects_by_address = _this6.balance_objects_by_address.set(address, _immutable2.default.Set(set));
        _this6.notifySubscribers();
      }, function () {
        _this6.balance_objects_by_address = _this6.balance_objects_by_address.delete(address);
      });
    }

    return this.balance_objects_by_address.get(address);
  };

  /**
   * @return a list of tournament ids for upcoming tournaments
   * @return an empty list if a query is pending and the set is not known at this time
   *         or if there are no upcoming touraments
   *
   * If we have not yet requested tournaments for this account, it will
   * send a request to the server for the current list, after which it
   * will be subscribed to changes to this set.
   */


  ChainStore.prototype.getTournamentIdsInState = function getTournamentIdsInState(accountId, stateString) {
    var _this7 = this;

    var tournamentIdsForThisAccountAndState = void 0;
    var tournamentIdsForThisAccount = this.tournament_ids_by_state.get(accountId);

    if (tournamentIdsForThisAccount === undefined) {
      tournamentIdsForThisAccountAndState = new _immutable2.default.Set();
      tournamentIdsForThisAccount = new _immutable2.default.Map().set(stateString, tournamentIdsForThisAccountAndState);
      this.tournament_ids_by_state = this.tournament_ids_by_state.set(accountId, tournamentIdsForThisAccount);
    } else {
      tournamentIdsForThisAccountAndState = tournamentIdsForThisAccount.get(stateString);

      if (tournamentIdsForThisAccountAndState !== undefined) {
        return tournamentIdsForThisAccountAndState;
      }

      tournamentIdsForThisAccountAndState = new _immutable2.default.Set();
      tournamentIdsForThisAccount = tournamentIdsForThisAccount.set(stateString, tournamentIdsForThisAccountAndState);
      this.tournament_ids_by_state = this.tournament_ids_by_state.set(accountId, tournamentIdsForThisAccount);
    }

    _ws.Apis.instance().db_api().exec('get_tournaments_in_state', [stateString, 100]).then(function (tournaments) {
      var originalTournamentIdsInState = _this7.tournament_ids_by_state.getIn([accountId, stateString]);
      // call updateObject on each tournament, which will classify it
      tournaments.forEach(function (tournament) {
        /**
         * Fix bug: we cant update tournament_ids_by_state if objects_by_id has a tournament
         */
        if (!originalTournamentIdsInState.get(tournament.id)) {
          _this7.clearObjectCache(tournament.id);
        }

        _this7._updateObject(tournament);
      });

      var tournament_id = _this7.tournament_ids_by_state.getIn([accountId, stateString]);

      if (tournament_id !== originalTournamentIdsInState) {
        _this7.notifySubscribers();
      }
    });
    return tournamentIdsForThisAccountAndState;
  };

  ChainStore.prototype.getRegisteredTournamentIds = function getRegisteredTournamentIds(accountId) {
    var _this8 = this;

    var tournamentIds = this.registered_tournament_ids_by_player.get(accountId);

    if (tournamentIds !== undefined) {
      return tournamentIds;
    }

    tournamentIds = new _immutable2.default.Set();
    this.registered_tournament_ids_by_player = this.registered_tournament_ids_by_player.set(accountId, tournamentIds);

    _ws.Apis.instance().db_api().exec('get_registered_tournaments', [accountId, 100]).then(function (registered_tournaments) {
      var originalTournamentIds = _this8.registered_tournament_ids_by_player.get(accountId);
      var newTournamentIds = new _immutable2.default.Set(registered_tournaments);

      if (!originalTournamentIds.equals(newTournamentIds)) {
        _this8.registered_tournament_ids_by_player = _this8.registered_tournament_ids_by_player.set(accountId, newTournamentIds);
        _this8.notifySubscribers();
      }
    });

    return tournamentIds;
  };

  /**
   *  If there is not already a pending request to fetch this object, a new
   *  request will be made.
   *
   *  @return null if the object does not exist,
   *  @return undefined if the object might exist but is not in cache
   *  @return the object if it does exist and is in our cache
   */


  ChainStore.prototype.fetchObject = function fetchObject(id) {
    var _this9 = this;

    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof id !== 'string') {
      var _result = [];

      for (var i = 0; i < id.length; ++i) {
        _result.push(this.fetchObject(id[i]));
      }

      return _result;
    }

    if (DEBUG) {
      console.log('!!! fetchObject: ', id, this.subscribed, !this.subscribed && !force);
    }

    if (!this.subscribed && !force) {
      return undefined;
    }

    if (DEBUG) {
      console.log('maybe fetch object: ', id);
    }

    if (!_ChainValidation2.default.is_object_id(id)) {
      throw Error('argument is not an object id: ' + id);
    }

    if (id.substring(0, 4) === '1.2.') {
      return this.fetchFullAccount(id);
    }

    if (id.search(witness_prefix) === 0) {
      this._subTo('witnesses', id);
    }

    if (id.search(committee_prefix) === 0) {
      this._subTo('committee', id);
    }

    var result = this.objects_by_id.get(id);

    if (result === undefined) {
      // the fetch
      if (DEBUG) {
        console.log('fetching object: ', id);
      }

      this.objects_by_id = this.objects_by_id.set(id, true);
      _ws.Apis.instance().db_api().exec('get_objects', [[id]]).then(function (optional_objects) {
        for (var _i = 0; _i < optional_objects.length; _i++) {
          var optional_object = optional_objects[_i];

          if (optional_object) {
            _this9._updateObject(optional_object, true);
            _this9.simple_objects_by_id = _this9.simple_objects_by_id.set(id, optional_object);
          } else {
            _this9.objects_by_id = _this9.objects_by_id.set(id, null);
            _this9.notifySubscribers();
          }
        }
      }).catch(function (error) {
        // in the event of an error clear the pending state for id
        console.log('!!! Chain API error', error);
        _this9.objects_by_id = _this9.objects_by_id.delete(id);
      });
    } else if (result === true) {
      // then we are waiting a response
      return undefined;
    }

    return result; // we have a response, return it
  };

  /**
   *  @return null if no such account exists
   *  @return undefined if such an account may exist,
   *  and fetch the the full account if not already pending
   *  @return the account object if it does exist
   */


  ChainStore.prototype.getAccount = function getAccount(name_or_id) {
    if (!name_or_id) {
      return null;
    }

    if ((typeof name_or_id === 'undefined' ? 'undefined' : _typeof(name_or_id)) === 'object') {
      if (name_or_id.id) {
        return this.getAccount(name_or_id.id);
      }

      if (name_or_id.get) {
        return this.getAccount(name_or_id.get('id'));
      }

      return undefined;
    }

    if (_ChainValidation2.default.is_object_id(name_or_id)) {
      var account = this.getObject(name_or_id);

      if (account === null) {
        return null;
      }

      if (account === undefined || account.get('name') === undefined) {
        return this.fetchFullAccount(name_or_id);
      }

      return account;
    }

    if (_ChainValidation2.default.is_account_name(name_or_id, true)) {
      var account_id = this.accounts_by_name.get(name_or_id);

      if (account_id === null) {
        return null; // already fetched and it wasn't found
      }

      if (account_id === undefined) {
        // then no query, fetch it
        return this.fetchFullAccount(name_or_id);
      }

      return this.getObject(account_id); // return it
    }
    // throw Error( `Argument is not an account name or id: ${name_or_id}` )
  };

  /**
   * This method will attempt to lookup witness by account_id.
   * If witness doesn't exist it will return null,
   * if witness is found it will return witness object,
   * if it's not fetched yet it will return undefined.
   * @param account_id - account id
   */


  ChainStore.prototype.getWitnessById = function getWitnessById(account_id) {
    var witness_id = this.witness_by_account_id.get(account_id);

    if (witness_id === undefined) {
      this.fetchWitnessByAccount(account_id);
      return undefined;
    }

    if (witness_id) {
      this._subTo('witnesses', witness_id);
    }

    return witness_id ? this.getObject(witness_id) : null;
  };

  /**
   * This method will attempt to lookup witness by account_id.
   * If witness doesn't exist it will return null,
   * if witness is found it will return witness object,
   * if it's not fetched yet it will return undefined.
   * @param witness_id - witness id
   */


  ChainStore.prototype.getWitnessAccount = function getWitnessAccount(witness_id) {
    var _this10 = this;

    return new Promise(function (success) {
      var account = _this10.account_by_witness_id.get(witness_id);

      if (account) {
        return success(account);
      }

      _this10.getSimpleObjectById(witness_id).then(function (witness) {
        _this10.getSimpleObjectById(witness.witness_account).then(function (fetched_account) {
          _this10.account_by_witness_id = _this10.account_by_witness_id.set(witness_id, fetched_account);
          success(fetched_account);
        });
      });
    });
  };

  /**
   * This method will attempt to lookup committee member by account_id.
   * If committee member doesn't exist it will return null,
   * if committee member is found it will return committee member object,
   * if it's not fetched yet it will return undefined.
   * @param account_id - account id
   */


  ChainStore.prototype.getCommitteeMemberById = function getCommitteeMemberById(account_id) {
    var cm_id = this.committee_by_account_id.get(account_id);

    if (cm_id === undefined) {
      this.fetchCommitteeMemberByAccount(account_id);
      return undefined;
    }

    if (cm_id) {
      this._subTo('committee', cm_id);
    }

    return cm_id ? this.getObject(cm_id) : null;
  };

  /**
   * Obsolete! Please use getWitnessById
   * This method will attempt to lookup the account, and then query to see whether or not there is
   * a witness for this account. If the answer is known, it will return the witness_object,
   * otherwise it will attempt to look it up and return null. Once the lookup has completed
   * on_update will be called.
   *
   * @param id_or_account may either be an account_id, a witness_id, or an account_name
   */


  ChainStore.prototype.getWitness = function getWitness(id_or_account) {
    console.log('DEPRECATED call to getWitness, use getWitnessById instead.');
    var account = this.getAccount(id_or_account);

    if (!account) {
      return null;
    }

    var account_id = account.get('id');

    var witness_id = this.witness_by_account_id.get(account_id);

    if (witness_id === undefined) {
      this.fetchWitnessByAccount(account_id);
    }

    return this.getObject(witness_id);
  };

  // Obsolete! Please use getCommitteeMemberById


  ChainStore.prototype.getCommitteeMember = function getCommitteeMember(id_or_account) {
    var _this11 = this;

    var on_update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    console.log('DEPRECATED call to getCommitteeMember, use getCommitteeMemberById instead.');

    var is_account = _ChainValidation2.default.is_account_name(id_or_account, true);

    if (is_account || id_or_account.substring(0, 4) === '1.2.') {
      var account = this.getAccount(id_or_account);

      if (!account) {
        this.lookupAccountByName(id_or_account).then(function (lookup_account) {
          var account_id = lookup_account.get('id');
          var committee_id = _this11.committee_by_account_id.get(account_id);

          if (_ChainValidation2.default.is_object_id(committee_id)) {
            return _this11.getObject(committee_id, on_update);
          }

          if (committee_id === undefined) {
            _this11.fetchCommitteeMemberByAccount(account_id).then(function (committee) {
              _this11.committee_by_account_id.set(account_id, committee ? committee.get('id') : null);

              if (on_update && committee) {
                on_update();
              }
            });
          }
        }, function () {
          _this11.committee_by_account_id.set(id_or_account, null);
        });
      } else {
        var account_id = account.get('id');
        var committee_id = this.committee_by_account_id.get(account_id);

        if (_ChainValidation2.default.is_object_id(committee_id)) {
          return this.getObject(committee_id, on_update);
        }

        if (committee_id === undefined) {
          this.fetchCommitteeMemberByAccount(account_id).then(function (committee) {
            _this11.committee_by_account_id.set(account_id, committee ? committee.get('id') : null);

            if (on_update && committee) {
              on_update();
            }
          });
        }
      }
    }

    return null;
  };

  /**
   *
   * @returns promise with a list of all witness ids, active or not.
   * @memberof ChainStore
   */


  ChainStore.prototype.fetchWitnessAccounts = function fetchWitnessAccounts() {
    var _this12 = this;

    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('lookup_witness_accounts', [0, 1000]).then(function (w) {
        if (w) {
          var witnessArr = [];
          var tmpObj = {};

          for (var i = 0, length = w.length; i < length; i++) {
            witnessArr.push(w[i][1]); // ids only

            if (tmpObj[w[i][0]] !== undefined) {
              tmpObj[w[i][0]].name = w[i][0];
              tmpObj[w[i][0]].id = w[i][1];
            } else {
              tmpObj.name = w[i][0];
              tmpObj.id = w[i][1];
            }
          }

          _this12.witnesses = _this12.witnesses.merge(witnessArr);
          _this12._updateObject(tmpObj, true);
          resolve(_this12.witnesses);
        } else {
          resolve(null);
        }
      });
    });
  };

  /**
   *
   * @return a promise with the witness object
   */


  ChainStore.prototype.fetchWitnessByAccount = function fetchWitnessByAccount(account_id) {
    var _this13 = this;

    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('get_witness_by_account', [account_id]).then(function (optional_witness_object) {
        if (optional_witness_object) {
          _this13._subTo('witnesses', optional_witness_object.id);
          _this13.witness_by_account_id = _this13.witness_by_account_id.set(optional_witness_object.witness_account, optional_witness_object.id);
          var witness_object = _this13._updateObject(optional_witness_object, true);
          resolve(witness_object);
        } else {
          _this13.witness_by_account_id = _this13.witness_by_account_id.set(account_id, null);
          _this13.notifySubscribers();
          resolve(null);
        }
      }, reject);
    });
  };

  /**
   *
   * @return a promise with the witness object
   */


  ChainStore.prototype.fetchCommitteeMemberByAccount = function fetchCommitteeMemberByAccount(account_id) {
    var _this14 = this;

    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('get_committee_member_by_account', [account_id]).then(function (optional_committee_object) {
        if (optional_committee_object) {
          _this14._subTo('committee', optional_committee_object.id);
          _this14.committee_by_account_id = _this14.committee_by_account_id.set(optional_committee_object.committee_member_account, optional_committee_object.id);
          var committee_object = _this14._updateObject(optional_committee_object, true);
          resolve(committee_object);
        } else {
          _this14.committee_by_account_id = _this14.committee_by_account_id.set(account_id, null);
          _this14.notifySubscribers();
          resolve(null);
        }
      }, reject);
    });
  };

  /**
   *  Fetches an account and all of its associated data in a single query
   *
   *  @param an account name or account id
   *
   *  @return undefined if the account in question is in the process of being fetched
   *  @return the object if it has already been fetched
   *  @return null if the object has been queried and was not found
   */


  ChainStore.prototype.fetchFullAccount = function fetchFullAccount(name_or_id) {
    var _this15 = this;

    if (DEBUG) {
      console.log('Fetch full account: ', name_or_id);
    }

    var fetch_account = false;

    if (_ChainValidation2.default.is_object_id(name_or_id)) {
      var current = this.objects_by_id.get(name_or_id);
      fetch_account = current === undefined;

      if (!fetch_account && fetch_account.get('name')) {
        return current;
      }
    } else {
      if (!_ChainValidation2.default.is_account_name(name_or_id, true)) {
        throw Error('argument is not an account name: ' + name_or_id);
      }

      var account_id = this.accounts_by_name.get(name_or_id);

      if (_ChainValidation2.default.is_object_id(account_id)) {
        return this.getAccount(account_id);
      }
    }

    // / only fetch once every 5 seconds if it wasn't found
    if (!this.fetching_get_full_accounts.has(name_or_id) || Date.now() - this.fetching_get_full_accounts.get(name_or_id) > 5000) {
      this.fetching_get_full_accounts.set(name_or_id, Date.now());
      // console.log( "FETCHING FULL ACCOUNT: ", name_or_id )
      _ws.Apis.instance().db_api().exec('get_full_accounts', [[name_or_id], true]).then(function (results) {
        if (results.length === 0) {
          if (_ChainValidation2.default.is_object_id(name_or_id)) {
            _this15.objects_by_id = _this15.objects_by_id.set(name_or_id, null);
            _this15.notifySubscribers();
          }

          return;
        }

        var full_account = results[0][1];

        if (DEBUG) {
          console.log('full_account: ', full_account);
        }

        _this15._subTo('accounts', full_account.account.id);

        var account = full_account.account,
            vesting_balances = full_account.vesting_balances,
            pending_dividend_payments = full_account.pending_dividend_payments,
            statistics = full_account.statistics,
            call_orders = full_account.call_orders,
            limit_orders = full_account.limit_orders,
            referrer_name = full_account.referrer_name,
            registrar_name = full_account.registrar_name,
            lifetime_referrer_name = full_account.lifetime_referrer_name,
            votes = full_account.votes,
            proposals = full_account.proposals;


        _this15.accounts_by_name = _this15.accounts_by_name.set(account.name, account.id);
        account.referrer_name = referrer_name;
        account.lifetime_referrer_name = lifetime_referrer_name;
        account.registrar_name = registrar_name;
        account.balances = {};
        account.orders = new _immutable2.default.Set();
        account.vesting_balances = new _immutable2.default.Set();
        account.pending_dividend_payments = new _immutable2.default.Set();
        account.balances = new _immutable2.default.Map();
        account.call_orders = new _immutable2.default.Set();
        account.proposals = new _immutable2.default.Set();
        account.vesting_balances = account.vesting_balances.withMutations(function (set) {
          vesting_balances.forEach(function (vb) {
            _this15._updateObject(vb);
            set.add(vb.id);
          });
        });

        var sub_to_objects = [];

        votes.forEach(function (v) {
          return _this15._updateObject(v);
        });

        account.balances = account.balances.withMutations(function (map) {
          full_account.balances.forEach(function (b) {
            _this15._updateObject(b);
            map.set(b.asset_type, b.id);
            sub_to_objects.push(b.id);
          });
        });

        account.orders = account.orders.withMutations(function (set) {
          limit_orders.forEach(function (order) {
            _this15._updateObject(order);
            set.add(order.id);
            sub_to_objects.push(order.id);
          });
        });

        account.pending_dividend_payments = account.pending_dividend_payments.withMutations(function (set) {
          pending_dividend_payments.forEach(function (payments) {
            _this15._updateObject(payments);
            set.add(payments);
            sub_to_objects.push(payments.id);
          });
        });

        account.call_orders = account.call_orders.withMutations(function (set) {
          call_orders.forEach(function (co) {
            _this15._updateObject(co);
            set.add(co.id);
            sub_to_objects.push(co.id);
          });
        });

        account.proposals = account.proposals.withMutations(function (set) {
          proposals.forEach(function (p) {
            _this15._updateObject(p);
            set.add(p.id);
            sub_to_objects.push(p.id);
          });
        });

        if (sub_to_objects.length) {
          _ws.Apis.instance().db_api().exec('get_objects', [sub_to_objects]);
        }

        _this15._updateObject(statistics);
        var updated_account = _this15._updateObject(account);
        _this15.fetchRecentHistory(updated_account);
        _this15.notifySubscribers();
      }, function (error) {
        console.log('Error: ', error);

        if (_ChainValidation2.default.is_object_id(name_or_id)) {
          _this15.objects_by_id = _this15.objects_by_id.delete(name_or_id);
        } else {
          _this15.accounts_by_name = _this15.accounts_by_name.delete(name_or_id);
        }
      });
    }

    return undefined;
  };

  ChainStore.getAccountMemberStatus = function getAccountMemberStatus(account) {
    if (account === undefined) {
      return undefined;
    }

    if (account === null) {
      return 'unknown';
    }

    if (account.get('lifetime_referrer') === account.get('id')) {
      return 'lifetime';
    }

    var exp = new Date(account.get('membership_expiration_date')).getTime();
    var now = new Date().getTime();

    if (exp < now) {
      return 'basic';
    }

    return 'annual';
  };

  ChainStore.prototype.getAccountBalance = function getAccountBalance(account, asset_type) {
    var balances = account.get('balances');

    if (!balances) {
      return 0;
    }

    var balance_obj_id = balances.get(asset_type);

    if (balance_obj_id) {
      var bal_obj = this.objects_by_id.get(balance_obj_id);

      if (bal_obj) {
        return bal_obj.get('balance');
      }
    }

    return 0;
  };

  /**
   * There are two ways to extend the account history, add new more
   * recent history, and extend historic hstory. This method will fetch
   * the most recent account history and prepend it to the list of
   * historic operations.
   *
   *  @param account immutable account object
   *  @return a promise with the account history
   */


  ChainStore.prototype.fetchRecentHistory = function fetchRecentHistory(account) {
    var _this16 = this;

    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

    var account_id = account;

    if (!_ChainValidation2.default.is_object_id(account_id) && account.toJS) {
      account_id = account.get('id');
    }

    if (!_ChainValidation2.default.is_object_id(account_id)) {
      return;
    }

    account = this.objects_by_id.get(account_id);

    if (!account) {
      return;
    }

    var pending_request = this.account_history_requests.get(account_id);

    if (pending_request) {
      pending_request.requests++;
      return pending_request.promise;
    }

    pending_request = { requests: 0 };

    var most_recent = '1.' + op_history + '.0';
    var history = account.get('history');

    if (history && history.size) {
      most_recent = history.first().get('id');
    }

    // / starting at 0 means start at NOW, set this to something other than 0
    // / to skip recent transactions and fetch the tail
    var start = '1.' + op_history + '.0';

    pending_request.promise = new Promise(function (resolve, reject) {
      _ws.Apis.instance().history_api().exec('get_account_history', [account_id, most_recent, limit, start]).then(function (operations) {
        var current_account = _this16.objects_by_id.get(account_id);
        var current_history = current_account.get('history');

        if (!current_history) {
          current_history = _immutable2.default.List();
        }

        var updated_history = _immutable2.default.fromJS(operations);
        updated_history = updated_history.withMutations(function (list) {
          for (var i = 0; i < current_history.size; ++i) {
            list.push(current_history.get(i));
          }
        });
        var updated_account = current_account.set('history', updated_history);
        _this16.objects_by_id = _this16.objects_by_id.set(account_id, updated_account);

        var request = _this16.account_history_requests.get(account_id);
        _this16.account_history_requests.delete(account_id);

        if (request.requests > 0) {
          // it looks like some more history may have come in while we were
          // waiting on the result, lets fetch anything new before we resolve
          // this query.
          _this16.fetchRecentHistory(updated_account, limit).then(resolve, reject);
        } else {
          resolve(updated_account);
        }
      }); // end then
    });

    this.account_history_requests.set(account_id, pending_request);
    return pending_request.promise;
  };

  /**
   * @brief Get a list of all sports
   */

  ChainStore.getSportsList = function getSportsList() {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('list_sports', []).then(function (sportsList) {
        if (sportsList) {
          resolve(sportsList);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  /**
   * @brief Return a list of all event groups for a sport (e.g. all soccer leagues in soccer)
   */

  ChainStore.prototype.getEventGroupsList = function getEventGroupsList(sportId) {
    var _this17 = this;

    var eventGroupsList = this.event_groups_list_by_sport_id.get(sportId);

    if (eventGroupsList === undefined) {
      this.event_groups_list_by_sport_id = this.event_groups_list_by_sport_id.set(sportId, _immutable2.default.Set());

      _ws.Apis.instance().db_api().exec('list_event_groups', [sportId]).then(function (eventGroups) {
        var set = new Set();

        for (var i = 0, len = eventGroups.length; i < len; ++i) {
          set.add(eventGroups[i]);
        }

        _this17.event_groups_list_by_sport_id = _this17.event_groups_list_by_sport_id.set(sportId, _immutable2.default.Set(set));
        _this17.notifySubscribers();
      }, function () {
        _this17.event_groups_list_by_sport_id = _this17.event_groups_list_by_sport_id.delete(sportId);
      });
    }

    return this.event_groups_list_by_sport_id.get(sportId);
  };

  /**
   * @brief Return a list of all betting market groups for an event
   */

  ChainStore.prototype.getBettingMarketGroupsList = function getBettingMarketGroupsList(eventId) {
    var _this18 = this;

    var bettingMarketGroupsList = this.betting_market_groups_list_by_sport_id.get(eventId);

    if (bettingMarketGroupsList === undefined) {
      this.betting_market_groups_list_by_sport_id = this.betting_market_groups_list_by_sport_id.set(eventId, _immutable2.default.Set());

      _ws.Apis.instance().db_api().exec('list_betting_market_groups', [eventId]).then(function (bettingMarketGroups) {
        var set = new Set();

        for (var i = 0, len = bettingMarketGroups.length; i < len; ++i) {
          set.add(bettingMarketGroups[i]);
        }

        _this18.betting_market_groups_list_by_sport_id = _this18.betting_market_groups_list_by_sport_id.set( // eslint-disable-line
        eventId, _immutable2.default.Set(set));
        _this18.notifySubscribers();
      }, function () {
        _this18.betting_market_groups_list_by_sport_id = _this18.betting_market_groups_list_by_sport_id.delete( // eslint-disable-line
        eventId);
      });
    }

    return this.betting_market_groups_list_by_sport_id.get(eventId);
  };

  /**
   * @brief Return a list of all betting markets for a betting market group
   */

  ChainStore.prototype.getBettingMarketsList = function getBettingMarketsList(bettingMarketGroupId) {
    var _this19 = this;

    var bettingMarketsList = this.betting_markets_list_by_sport_id.get(bettingMarketGroupId);

    if (bettingMarketsList === undefined) {
      this.betting_markets_list_by_sport_id = this.betting_markets_list_by_sport_id.set(bettingMarketGroupId, _immutable2.default.Set());

      _ws.Apis.instance().db_api().exec('list_betting_markets', [bettingMarketGroupId]).then(function (bettingMarkets) {
        var set = new Set();

        for (var i = 0, len = bettingMarkets.length; i < len; ++i) {
          set.add(bettingMarkets[i]);
        }

        _this19.betting_markets_list_by_sport_id = _this19.betting_markets_list_by_sport_id.set(bettingMarketGroupId, _immutable2.default.Set(set));
        _this19.notifySubscribers();
      }, function () {
        _this19.betting_markets_list_by_sport_id = _this19.betting_markets_list_by_sport_id.delete(bettingMarketGroupId);
      });
    }

    return this.betting_markets_list_by_sport_id.get(bettingMarketGroupId);
  };

  /**
   * @brief Get global betting statistics
   */

  ChainStore.getGlobalBettingStatistics = function getGlobalBettingStatistics() {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('get_global_betting_statistics', []).then(function (getGlobalBettingStatistics) {
        if (getGlobalBettingStatistics) {
          resolve(getGlobalBettingStatistics);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getBinnedOrderBook = function getBinnedOrderBook(betting_market_id, precision) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().bookie_api().exec('get_binned_order_book', [betting_market_id, precision]).then(function (order_book_object) {
        if (order_book_object) {
          resolve(order_book_object);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getTotalMatchedBetAmountForBettingMarketGroup = function getTotalMatchedBetAmountForBettingMarketGroup(group_id) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().bookie_api().exec('get_total_matched_bet_amount_for_betting_market_group', [group_id]).then(function (total_matched_bet_amount) {
        if (total_matched_bet_amount) {
          resolve(total_matched_bet_amount);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getEventsContainingSubString = function getEventsContainingSubString(sub_string, language) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().bookie_api().exec('get_events_containing_sub_string', [sub_string, language]).then(function (events_containing_sub_string) {
        if (events_containing_sub_string) {
          resolve(events_containing_sub_string);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getUnmatchedBetsForBettor = function getUnmatchedBetsForBettor(betting_market_id_type, account_id_type) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('get_unmatched_bets_for_bettor', [betting_market_id_type, account_id_type]).then(function (unmatched_bets_for_bettor) {
        if (unmatched_bets_for_bettor) {
          resolve(unmatched_bets_for_bettor);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.listEventsInGroup = function listEventsInGroup(event_group_id) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('list_events_in_group', [event_group_id]).then(function (events_in_group) {
        if (events_in_group) {
          resolve(events_in_group);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getAllUnmatchedBetsForBettor = function getAllUnmatchedBetsForBettor(account_id_type) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().db_api().exec('get_all_unmatched_bets_for_bettor', [account_id_type]).then(function (all_unmatched_bets_for_bettor) {
        if (all_unmatched_bets_for_bettor) {
          resolve(all_unmatched_bets_for_bettor);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getMatchedBetsForBettor = function getMatchedBetsForBettor(bettor_id) {
    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().bookie_api().exec('get_matched_bets_for_bettor', [bettor_id]).then(function (matched_bets_for_bettor) {
        if (matched_bets_for_bettor) {
          resolve(matched_bets_for_bettor);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  ChainStore.getAllMatchedBetsForBettor = function getAllMatchedBetsForBettor(bettor_id, start) {
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;

    return new Promise(function (resolve, reject) {
      _ws.Apis.instance().bookie_api().exec('get_all_matched_bets_for_bettor', [bettor_id, start, limit]).then(function (all_matched_bets_for_bettor) {
        if (all_matched_bets_for_bettor) {
          resolve(all_matched_bets_for_bettor);
        } else {
          resolve(null);
        }
      }, reject);
    });
  };

  /**
   *  Updates the object in place by only merging the set
   *  properties of object.
   *
   *  This method will create an immutable object with the given ID if
   *  it does not already exist.
   *
   *  This is a "private" method called when data is received from the
   *  server and should not be used by others.
   *
   *  @pre object.id must be a valid object ID
   *  @return an Immutable constructed from object and deep merged with the current state
   */


  ChainStore.prototype._updateObject = function _updateObject(object) {
    var notify_subscribers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var emit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!('id' in object)) {
      console.log('object with no id:', object);

      if ('balance' in object && 'owner' in object && 'settlement_date' in object) {
        // Settle order object
        emitter.emit('settle-order-update', object);
      }

      return;
    }

    var objectSpace = object.id.split('.').slice(0, -1);
    objectSpace.push(null); // Push an empty element into the array to take up the id space.
    objectSpace = objectSpace.join('.');

    /*
    * A lot of objects get spammed by the API that we don't care about, filter these out here
    */
    // Transaction object
    if (objectSpace === transaction_prefix) {
      return; // console.log("not interested in transaction:", object);
    }

    if (objectSpace === account_transaction_history_prefix) {
      // transaction_history object
      if (!this._isSubbedTo('accounts', object.account)) {
        return; // console.log("not interested in transaction_history of", object.account);
      }
    } else if (objectSpace === order_prefix) {
      // limit_order object
      if (!this._isSubbedTo('accounts', object.seller)) {
        return; // console.log("not interested in limit_orders of", object.seller);
      }
    } else if (objectSpace === call_order_prefix) {
      // call_order object
      if (!this._isSubbedTo('accounts', object.borrower)) {
        return; // console.log("not interested in call_orders of", object.borrower);
      }
    } else if (objectSpace === balance_prefix) {
      // balance object
      if (!this._isSubbedTo('accounts', object.owner)) {
        return; // console.log("not interested in balance_object of", object.owner);
      }
    } else if (objectSpace === operation_history_prefix) {
      // operation_history object
      return; // console.log("not interested in operation_history", object);
    } else if (objectSpace === block_summary_prefix) {
      // block_summary object
      return; // console.log("not interested in block_summary_prefix", object);
    } else if (objectSpace === account_stats_prefix) {
      // account_stats object
      if (!this._isSubbedTo('accounts', object.owner)) {
        return; // console.log("not interested in stats of", object.owner);
      }
    } else if (objectSpace === witness_prefix) {
      // witness object
      if (!this._isSubbedTo('witnesses', object.id)) {
        return;
      }
    } else if (objectSpace === committee_prefix) {
      // committee_member object
      if (!this._isSubbedTo('committee', object.id)) {
        return;
      }
    }

    // DYNAMIC GLOBAL OBJECT
    if (object.id === '2.1.0') {
      object.participation = 100 * ((0, _bigi2.default)(object.recent_slots_filled).bitCount() / 128.0);
      this.head_block_time_string = object.time;
      this.chain_time_offset.push(Date.now() - ChainStore.timeStringToDate(object.time).getTime());

      if (this.chain_time_offset.length > 10) {
        this.chain_time_offset.shift(); // remove first
      }

      this.fetchRecentOperations(object.head_block_number);
    }

    var current = this.objects_by_id.get(object.id, undefined);

    if (current === undefined || current === true) {
      current = _immutable2.default.Map();
    }

    var prior = current;

    if (current === undefined || current === true) {
      this.objects_by_id = this.objects_by_id.set(object.id, current = _immutable2.default.fromJS(object));
    } else {
      this.objects_by_id = this.objects_by_id.set(object.id, current = current.mergeDeep(_immutable2.default.fromJS(object)));
    }

    // BALANCE OBJECT
    if (objectSpace === balance_prefix) {
      var owner = this.objects_by_id.get(object.owner);

      if (owner === undefined || owner === null) {
        return;
        /*  This prevents the full account from being looked up later
            owner = {id:object.owner, balances:{ } }
            owner.balances[object.asset_type] = object.id
            owner = Immutable.fromJS( owner )
            */
      }

      var balances = owner.get('balances');

      if (!balances) {
        owner = owner.set('balances', _immutable2.default.Map());
      }

      owner = owner.setIn(['balances', object.asset_type], object.id);

      this.objects_by_id = this.objects_by_id.set(object.owner, owner);
    } else if (objectSpace === account_stats_prefix) {
      // ACCOUNT STATS OBJECT
      // console.log( "HISTORY CHANGED" )
      var prior_most_recent_op = prior ? prior.get('most_recent_op') : '2.9.0';

      if (prior_most_recent_op !== object.most_recent_op) {
        this.fetchRecentHistory(object.owner);
      }
    } else if (objectSpace === witness_prefix) {
      // WITNESS OBJECT
      if (this._isSubbedTo('witnesses', object.id)) {
        this.witness_by_account_id.set(object.witness_account, object.id);
        this.objects_by_vote_id.set(object.vote_id, object.id);
      } else {
        return;
      }
    } else if (objectSpace === committee_prefix) {
      // COMMITTEE MEMBER OBJECT
      if (this._isSubbedTo('committee', object.id)) {
        this.committee_by_account_id.set(object.committee_member_account, object.id);
        this.objects_by_vote_id.set(object.vote_id, object.id);
      } else {
        return;
      }
    } else if (objectSpace === account_prefix) {
      // ACCOUNT OBJECT
      current = current.set('active', _immutable2.default.fromJS(object.active));
      current = current.set('owner', _immutable2.default.fromJS(object.owner));
      current = current.set('options', _immutable2.default.fromJS(object.options));
      current = current.set('pending_dividend_payments', _immutable2.default.fromJS(object.pending_dividend_payments));
      current = current.set('whitelisting_accounts', _immutable2.default.fromJS(object.whitelisting_accounts));
      current = current.set('blacklisting_accounts', _immutable2.default.fromJS(object.blacklisting_accounts));
      current = current.set('whitelisted_accounts', _immutable2.default.fromJS(object.whitelisted_accounts));
      current = current.set('blacklisted_accounts', _immutable2.default.fromJS(object.blacklisted_accounts));
      this.objects_by_id = this.objects_by_id.set(object.id, current);
      this.accounts_by_name = this.accounts_by_name.set(object.name, object.id);
    } else if (objectSpace === asset_prefix) {
      // ASSET OBJECT
      this.assets_by_symbol = this.assets_by_symbol.set(object.symbol, object.id);
      var dynamic = current.get('dynamic');

      if (!dynamic) {
        var dad = this.getObject(object.dynamic_asset_data_id, true);

        if (!dad) {
          dad = _immutable2.default.Map();
        }

        if (!dad.get('asset_id')) {
          dad = dad.set('asset_id', object.id);
        }

        this.objects_by_id = this.objects_by_id.set(object.dynamic_asset_data_id, dad);

        current = current.set('dynamic', dad);
        this.objects_by_id = this.objects_by_id.set(object.id, current);
      }

      var bitasset = current.get('bitasset');

      if (!bitasset && object.bitasset_data_id) {
        var bad = this.getObject(object.bitasset_data_id, true);

        if (!bad) {
          bad = _immutable2.default.Map();
        }

        if (!bad.get('asset_id')) {
          bad = bad.set('asset_id', object.id);
        }

        this.objects_by_id = this.objects_by_id.set(object.bitasset_data_id, bad);

        current = current.set('bitasset', bad);
        this.objects_by_id = this.objects_by_id.set(object.id, current);
      }
    } else if (objectSpace === asset_dynamic_data_prefix) {
      // ASSET DYNAMIC DATA OBJECT
      var asset_id = current.get('asset_id');

      if (asset_id) {
        var asset_obj = this.getObject(asset_id);

        if (asset_obj && asset_obj.set) {
          asset_obj = asset_obj.set('dynamic', current);
          this.objects_by_id = this.objects_by_id.set(asset_id, asset_obj);
        }
      }
    } else if (objectSpace === worker_prefix) {
      // WORKER OBJECT
      this.objects_by_vote_id.set(object.vote_for, object.id);
      this.objects_by_vote_id.set(object.vote_against, object.id);
    } else if (objectSpace === bitasset_data_prefix) {
      // BITASSET DATA OBJECT
      var _asset_id = current.get('asset_id');

      if (_asset_id) {
        var asset = this.getObject(_asset_id);

        if (asset) {
          asset = asset.set('bitasset', current);
          emitter.emit('bitasset-update', asset);
          this.objects_by_id = this.objects_by_id.set(_asset_id, asset);
        }
      }
    } else if (objectSpace === call_order_prefix) {
      // CALL ORDER OBJECT
      // Update nested call_orders inside account object
      if (emit) {
        emitter.emit('call-order-update', object);
      }

      var account = this.objects_by_id.get(object.borrower);

      if (account && account.has('call_orders')) {
        var call_orders = account.get('call_orders');

        if (!call_orders.has(object.id)) {
          account = account.set('call_orders', call_orders.add(object.id));
          this.objects_by_id = this.objects_by_id.set(account.get('id'), account);
          // Force subscription to the object in the witness node by calling get_objects
          _ws.Apis.instance().db_api().exec('get_objects', [[object.id]]);
        }
      }
    } else if (objectSpace === order_prefix) {
      // LIMIT ORDER OBJECT
      var _account2 = this.objects_by_id.get(object.seller);

      if (_account2 && _account2.has('orders')) {
        var limit_orders = _account2.get('orders');

        if (!limit_orders.has(object.id)) {
          _account2 = _account2.set('orders', limit_orders.add(object.id));
          this.objects_by_id = this.objects_by_id.set(_account2.get('id'), _account2);
          // Force subscription to the object in the witness node by calling get_objects
          _ws.Apis.instance().db_api().exec('get_objects', [[object.id]]);
        }
      }
    } else if (objectSpace === proposal_prefix) {
      // PROPOSAL OBJECT
      this.addProposalData(object.required_active_approvals, object.id);
      this.addProposalData(object.required_owner_approvals, object.id);
    } else if (objectSpace === tournament_prefix) {
      // TOURNAMENT OBJECT
      var priorState = prior.get('state');
      var newState = current.get('state');

      if (priorState !== newState) {
        this.tournament_ids_by_state = this.tournament_ids_by_state.map(function (stateMap, accountId) {
          return stateMap.map(function (tournamentIdSet, stateString) {
            if (stateString === priorState) {
              return tournamentIdSet.remove(object.id);
            }

            if (stateString === newState && (accountId === null || current.getIn(['options', 'whitelist']).isEmpty() || current.getIn(['options', 'whitelist']).includes(accountId))) {
              return tournamentIdSet.add(object.id);
            }

            return tournamentIdSet;
          });
        });
      }

      if (this.last_tournament_id !== undefined) {
        this.setLastTournamentId(current.get('id'));
      }
    } else if (objectSpace === tournament_details_prefix) {
      var priorRegisteredPlayers = prior.get('registered_players');
      var newRegisteredPlayers = current.get('registered_players');

      if (priorRegisteredPlayers !== newRegisteredPlayers) {
        this.registered_tournament_ids_by_player = this.registered_tournament_ids_by_player.map(function (tournamentIdsSet, accountId) {
          if (newRegisteredPlayers.includes(accountId)) {
            return tournamentIdsSet.add(current.get('tournament_id'));
          }

          return tournamentIdsSet;

          // currently, you can't un-register for a tournament, so we don't have
          // to deal with removing from a list
        });
      }
    }

    if (notify_subscribers) {
      this.notifySubscribers();
    }

    return current;
  };

  ChainStore.prototype.setLastTournamentId = function setLastTournamentId(current_tournament_id) {
    if (current_tournament_id === null) {
      if (!this.last_tournament_id) {
        this.last_tournament_id = current_tournament_id;
      }
    } else {
      var current_short_string = current_tournament_id.substring(tournament_prefix.length);
      var current_short = parseFloat(current_short_string);

      var last_short = -1;

      if (this.last_tournament_id) {
        last_short = parseFloat(this.last_tournament_id.substring(tournament_prefix.length));
      }

      if (current_short > last_short) {
        this.last_tournament_id = current_tournament_id;
      }
    }
  };

  ChainStore.prototype.getTournaments = function getTournaments(last_tournament_id) {
    var _this20 = this;

    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var start_tournament_id = arguments[2];

    return _ws.Apis.instance().db_api().exec('get_tournaments', [last_tournament_id, limit, start_tournament_id]).then(function (tournaments) {
      var list = _immutable2.default.List();

      _this20.setLastTournamentId(null);

      if (tournaments && tournaments.length) {
        list = list.withMutations(function (l) {
          tournaments.forEach(function (tournament) {
            if (!_this20.objects_by_id.has(tournament.id)) {
              _this20._updateObject(tournament);
            }

            l.unshift(_this20.objects_by_id.get(tournament.id));
          });
        });
      }

      return list;
    });
  };

  ChainStore.prototype.getLastTournamentId = function getLastTournamentId() {
    var _this21 = this;

    return new Promise(function (resolve) {
      if (_this21.last_tournament_id === undefined) {
        _ws.Apis.instance().db_api().exec('get_tournaments', [tournament_prefix + '0', 1, tournament_prefix + '0']).then(function (tournaments) {
          _this21.setLastTournamentId(null);

          if (tournaments && tournaments.length) {
            tournaments.forEach(function (tournament) {
              _this21._updateObject(tournament);
            });
          }

          resolve(_this21.last_tournament_id);
        });
      } else {
        resolve(_this21.last_tournament_id);
      }
    });
  };

  ChainStore.prototype.getObjectsByVoteIds = function getObjectsByVoteIds(vote_ids) {
    var _this22 = this;

    var result = [];
    var missing = [];

    for (var i = 0; i < vote_ids.length; ++i) {
      var obj = this.objects_by_vote_id.get(vote_ids[i]);

      if (obj) {
        result.push(this.getObject(obj));
      } else {
        missing.push(vote_ids[i]);
      }
    }

    if (missing.length) {
      // we may need to fetch some objects
      _ws.Apis.instance().db_api().exec('lookup_vote_ids', [missing]).then(function (vote_obj_array) {
        for (var _i2 = 0; _i2 < vote_obj_array.length; ++_i2) {
          if (vote_obj_array[_i2]) {
            _this22._updateObject(vote_obj_array[_i2]);
            var immutableMapConvert = _immutable2.default.fromJS(vote_obj_array[_i2]);
            result.push(immutableMapConvert);
          }
        }
      }, function (error) {
        return console.log('Error looking up vote ids: ', error);
      });
    }

    return result;
  };

  ChainStore.prototype.getObjectByVoteID = function getObjectByVoteID(vote_id) {
    var obj_id = this.objects_by_vote_id.get(vote_id);

    if (obj_id) {
      return this.getObject(obj_id);
    }

    return undefined;
  };

  ChainStore.prototype.getHeadBlockDate = function getHeadBlockDate() {
    return ChainStore.timeStringToDate(this.head_block_time_string);
  };

  ChainStore.prototype.getEstimatedChainTimeOffset = function getEstimatedChainTimeOffset() {
    if (this.chain_time_offset.length === 0) {
      return 0;
    }

    // Immutable is fast, sorts numbers correctly, and leaves the original unmodified
    // This will fix itself if the user changes their clock
    var median_offset = _immutable2.default.List(this.chain_time_offset).sort().get(Math.floor((this.chain_time_offset.length - 1) / 2));
    // console.log("median_offset", median_offset)
    return median_offset;
  };

  ChainStore.prototype.addProposalData = function addProposalData(approvals, objectId) {
    var _this23 = this;

    approvals.forEach(function (id) {
      var impactedAccount = _this23.objects_by_id.get(id);

      if (impactedAccount) {
        var proposals = impactedAccount.get('proposals');

        if (!proposals.includes(objectId)) {
          proposals = proposals.add(objectId);
          impactedAccount = impactedAccount.set('proposals', proposals);
          _this23._updateObject(impactedAccount.toJS());
        }
      }
    });
  };

  ChainStore.timeStringToDate = function timeStringToDate(time_string) {
    if (!time_string) {
      return new Date('1970-01-01T00:00:00.000Z');
    }

    // does not end in Z
    if (!/Z$/.test(time_string)) {
      // https://github.com/cryptonomex/graphene/issues/368
      time_string += 'Z';
    }

    return new Date(time_string);
  };

  ChainStore.prototype.__getBlocksForScan = function __getBlocksForScan(lastBlock) {
    var _this24 = this;

    var db_api = _ws.Apis.instance().db_api();
    return new Promise(function (success) {
      var scanToBlock = _this24.last_processed_block;

      if (lastBlock) {
        return success({ lastBlock: lastBlock, scanToBlock: scanToBlock });
      }

      db_api.exec('get_dynamic_global_properties', []).then(function (globalProperties) {
        _this24.last_processed_block = globalProperties.head_block_number;
        scanToBlock = globalProperties.head_block_number - 2000;
        scanToBlock = scanToBlock < 0 ? 1 : scanToBlock;
        return success({
          lastBlock: _this24.last_processed_block,
          scanToBlock: scanToBlock
        });
      });
    });
  };

  ChainStore.prototype.__bindBlock = function __bindBlock(lastBlock, scanToBlock, isInit) {
    var _this25 = this;

    var db_api = _ws.Apis.instance().db_api();
    return new Promise(function (success) {
      db_api.exec('get_block', [lastBlock]).then(function (block) {
        block.id = lastBlock;

        if (typeof block.timestamp === 'string') {
          block.timestamp += '+00:00';
        }

        block.timestamp = new Date(block.timestamp);
        _this25.getWitnessAccount(block.witness).then(function (witness) {
          block.witness_account_name = witness.name;

          if (!_this25.recent_blocks_by_id.get(lastBlock)) {
            _this25.recent_blocks_by_id = _this25.recent_blocks_by_id.set(lastBlock, block);

            if (_this25.last_processed_block < lastBlock) {
              _this25.last_processed_block = lastBlock;
            }

            if (!isInit) {
              _this25.recent_blocks = _this25.recent_blocks.unshift(block);

              if (_this25.recent_blocks.size > block_stack_size) {
                _this25.recent_blocks = _this25.recent_blocks.pop();
              }
            } else if (_this25.recent_blocks.size < block_stack_size) {
              _this25.recent_blocks = _this25.recent_blocks.push(block);
            }

            block.transactions.forEach(function (tx) {
              return tx.operations.forEach(function (op) {
                op[1].block_id = lastBlock;
                op[1].created_at = block.timestamp;

                if (!isInit) {
                  _this25.recent_operations = _this25.recent_operations.unshift(op);
                } else {
                  if (_this25.recent_operations.size < operations_stack_size) {
                    _this25.recent_operations = _this25.recent_operations.push(op);
                  }

                  if (_this25.recent_operations.size >= operations_stack_size && _this25.recent_blocks.size >= block_stack_size) {
                    scanToBlock = lastBlock;
                  }
                }

                if (_this25.recent_operations.size > operations_stack_size) {
                  _this25.recent_operations = _this25.recent_operations.pop();
                }
              });
            });
          }

          lastBlock--;

          if (lastBlock <= scanToBlock) {
            return success();
          }

          _this25.__bindBlock(lastBlock, scanToBlock, isInit).then(function () {
            return success();
          });
        });
      });
    });
  };

  ChainStore.prototype.fetchRecentOperations = function fetchRecentOperations() {
    var _this26 = this;

    var lastBlock = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (lastBlock && !this.last_processed_block) {
      return;
    }

    var isInit = !lastBlock;

    this.__getBlocksForScan(lastBlock).then(function (_ref) {
      var last = _ref.lastBlock,
          scanToBlock = _ref.scanToBlock;

      _this26.__bindBlock(last, scanToBlock, isInit).then(function () {
        if (isInit) {
          _this26.store_initialized = true;
        }
      });
    });
  };

  ChainStore.prototype.getRecentBlocks = function getRecentBlocks() {
    return this.recent_blocks;
  };

  ChainStore.prototype.getRecentOperations = function getRecentOperations() {
    if (!this.store_initialized) {
      return _immutable2.default.List();
    }

    return this.recent_operations;
  };

  return ChainStore;
}();

var chain_store = new ChainStore();

function FetchChainObjects(method, object_ids, timeout) {
  var get_object = method.bind(chain_store);

  return new Promise(function (resolve, reject) {
    var timeout_handle = null;

    function onUpdate() {
      var not_subscribed_yet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var res = object_ids.map(function (id) {
        return get_object(id);
      });

      if (res.findIndex(function (o) {
        return o === undefined;
      }) === -1) {
        if (timeout_handle) {
          clearTimeout(timeout_handle);
        }

        if (!not_subscribed_yet) {
          chain_store.unsubscribe(onUpdate);
        }

        resolve(res);
        return true;
      }

      return false;
    }

    var resolved = onUpdate(true);

    if (!resolved) {
      chain_store.subscribe(onUpdate);
    }

    if (timeout && !resolved) {
      timeout_handle = setTimeout(function () {
        chain_store.unsubscribe(onUpdate);
        reject(new Error('timeout'));
      }, timeout);
    }
  });
}

chain_store.FetchChainObjects = FetchChainObjects;

function FetchChain(methodName, objectIds) {
  var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1900;

  var method = chain_store[methodName];

  if (!method) {
    throw new Error('ChainStore does not have method ' + methodName);
  }

  var arrayIn = Array.isArray(objectIds);

  if (!arrayIn) {
    objectIds = [objectIds];
  }

  return chain_store.FetchChainObjects(method, _immutable2.default.List(objectIds), timeout).then(function (res) {
    return arrayIn ? res : res.get(0);
  });
}

chain_store.FetchChain = FetchChain;

exports.default = chain_store;
module.exports = exports['default'];