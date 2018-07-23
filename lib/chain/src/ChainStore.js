import Immutable from 'immutable';
import {Apis} from 'peerplaysjs-ws';
import BigInteger from 'bigi';
import ChainTypes from './ChainTypes';
import ChainValidation from './ChainValidation';
import ee from './EmitterInstance';

const {object_type, impl_object_type} = ChainTypes;
let emitter = ee.emitter();

let op_history = parseInt(object_type.operation_history, 10);
let limit_order = parseInt(object_type.limit_order, 10);
let call_order = parseInt(object_type.call_order, 10);
let proposal = parseInt(object_type.proposal, 10);
let witness_object_type = parseInt(object_type.witness, 10);
let worker_object_type = parseInt(object_type.worker, 10);
let committee_member_object_type = parseInt(object_type.committee_member, 10);
let account_object_type = parseInt(object_type.account, 10);
let asset_object_type = parseInt(object_type.asset, 10);
let tournament_object_type = parseInt(object_type.tournament, 10);
let tournament_details_object_type = parseInt(object_type.tournament_details, 10);

let order_prefix = `1.${limit_order}.`;
let call_order_prefix = `1.${call_order}.`;
let proposal_prefix = `1.${proposal}.`;
let operation_history_prefix = `1.${op_history}.`;
let balance_prefix = `2.${parseInt(impl_object_type.account_balance, 10)}.`;
let account_stats_prefix = `2.${parseInt(impl_object_type.account_statistics, 10)}.`;
let transaction_prefix = `2.${parseInt(impl_object_type.transaction, 10)}.`;
let account_transaction_history_prefix = `2.${parseInt(
  impl_object_type.account_transaction_history,
  10
)}.`;
let asset_dynamic_data_prefix = `2.${parseInt(impl_object_type.asset_dynamic_data, 10)}.`;
let bitasset_data_prefix = `2.${parseInt(impl_object_type.asset_bitasset_data, 10)}.`;
let block_summary_prefix = `2.${parseInt(impl_object_type.block_summary, 10)}.`;
let witness_prefix = `1.${witness_object_type}.`;
let worker_prefix = `1.${worker_object_type}.`;
let committee_prefix = `1.${committee_member_object_type}.`;
let asset_prefix = `1.${asset_object_type}.`;
let account_prefix = `1.${account_object_type}.`;
let tournament_prefix = `1.${tournament_object_type}.`;
let tournament_details_prefix = `1.${tournament_details_object_type}.`;

// count last operations should be stored in memory
let operations_stack_size = 100;
// count last blocks should be stored in memory
let block_stack_size = 20;

const DEBUG = JSON.parse(process.env.npm_config__graphene_chain_chain_debug || false);

/**
 *  @brief maintains a local cache of blockchain state
 *
 *  The ChainStore maintains a local cache of blockchain state and exposes
 *  an API that makes it easy to query objects and receive updates when
 *  objects are available.
 */
class ChainStore {
  constructor() {
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
  clearCache() {
    this.objects_by_id = Immutable.Map();
    this.accounts_by_name = Immutable.Map();
    this.assets_by_symbol = Immutable.Map();
    this.account_ids_by_key = Immutable.Map();
    this.balance_objects_by_address = Immutable.Map();
    this.get_account_refs_of_keys_calls = Immutable.Set();
    this.event_groups_list_by_sport_id = Immutable.Map();
    this.betting_market_groups_list_by_sport_id = Immutable.Map();
    this.betting_markets_list_by_sport_id = Immutable.Map();
    this.account_history_requests = new Map(); // /< tracks pending history requests
    this.witness_by_account_id = new Map();
    this.account_by_witness_id = new Map();
    this.committee_by_account_id = new Map();
    this.objects_by_vote_id = new Map();
    this.fetching_get_full_accounts = new Map();
    this.recent_operations = Immutable.List();
    this.recent_blocks = Immutable.List();
    this.recent_blocks_by_id = Immutable.Map();
    this.last_processed_block = null;
    this.simple_objects_by_id = Immutable.Map();

    clearTimeout(this.timeout);

    // tournament_ids_by_state is a
    //   Map(account => Map(state_string => Set of tournament ids))
    // it maintains a map of tournaments a given account is allowed to participate
    // in (open-registration tournaments or tournaments they are whitelisted for).
    // the null account maps to all tournaments
    // accounts and states will not be tracked until their first access
    this.tournament_ids_by_state = Immutable.Map().set(null, new Immutable.Map());

    // registered_tournaments_details_by_player is a map of
    //   Map(registered_account_id => Set of tournament details objects)
    // it only tracks tournaments which the account has registered to play in
    this.registered_tournament_ids_by_player = Immutable.Map();

    this.last_tournament_id = undefined;

    this.store_initialized = false;
  }

  resetCache() {
    this.subscribed = false;
    this.subError = null;
    this.clearCache();
    this.head_block_time_string = null;
    this.init()
      .then(() => {
        console.log('resetCache init success');
      })
      .catch((err) => {
        console.log('resetCache init error:', err);
      });
  }

  setDispatchFrequency(freq) {
    this.dispatchFrequency = freq;
  }

  init() {
    let reconnectCounter = 0;

    let _init = (resolve, reject) => {
      if (this.subscribed) {
        return resolve();
      }

      let db_api = Apis.instance().db_api();

      if (!db_api) {
        return reject(
          new Error(
            'Api not found, please initialize the api instance before calling the ChainStore'
          )
        );
      }

      return db_api
        .exec('get_objects', [['2.1.0']])
        .then((optional_objects) => {
          for (let i = 0, len = optional_objects.length; i < len; i++) {
            let optional_object = optional_objects[i];

            if (optional_object) {
              this._updateObject(optional_object, true);

              let head_time = new Date(`${optional_object.time}+00:00`).getTime();
              this.head_block_time_string = optional_object.time;
              this.chain_time_offset.push(
                new Date().getTime() - ChainStore.timeStringToDate(optional_object.time).getTime()
              );
              let now = new Date().getTime();
              let delta = (now - head_time) / 1000;
              let start = Date.parse('Sep 1, 2015');
              let progress_delta = head_time - start;
              this.progress = progress_delta / (now - start);

              if (delta < 60) {
                Apis.instance()
                  .db_api()
                  .exec('set_subscribe_callback', [this.onUpdate.bind(this), true])
                  .then(() => {
                    console.log('synced and subscribed, chainstore ready');
                    this.subscribed = true;
                    this.fetchRecentOperations();
                    this.subError = null;
                    resolve();
                  })
                  .catch((error) => {
                    this.subscribed = false;
                    this.subError = error;
                    reject(error);
                    console.log('Error: ', error);
                  });
              } else {
                console.log('not yet synced, retrying in 1s');
                this.subscribed = false;
                reconnectCounter++;

                if (reconnectCounter > 5) {
                  this.subError = new Error(
                    'ChainStore sync error, please check your system clock'
                  );
                  return reject(this.subError);
                }

                setTimeout(_init.bind(this, resolve, reject), 1000);
              }
            } else {
              setTimeout(_init.bind(this, resolve, reject), 1000);
            }
          }
        })
        .catch((error) => {
          // in the event of an error clear the pending state for id
          console.log('!!! Chain API error', error);
          this.objects_by_id = this.objects_by_id.delete('2.1.0');
          reject(error);
        });
    };

    return Apis.instance().init_promise.then(() => new Promise(_init));
  }

  _subTo(type, id) {
    let key = `subbed_${type}`;

    if (!this[key].has(id)) {
      this[key].add(id);
    }
  }

  unSubFrom(type, id) {
    let key = `subbed_${type}`;
    this[key].delete(id);
    this.objects_by_id.delete(id);
  }

  _isSubbedTo(type, id) {
    let key = `subbed_${type}`;
    return this[key].has(id);
  }

  // / map from account id to objects
  onUpdate(updated_objects) {
    let cancelledOrders = [];
    let closedCallOrders = [];

    emitter.emit('heartbeat');

    // updated_objects is the parameter list, it should always be exactly
    // one element long.
    // The single parameter to this callback function is a vector of variants, where
    // each entry indicates one changed object.
    // If the entry is an object id, it means the object has been removed.  If it
    // is an full object, then the object is either newly-created or changed.
    for (let a = 0, len = updated_objects.length; a < len; ++a) {
      for (let i = 0, sub_len = updated_objects[a].length; i < sub_len; ++i) {
        let obj = updated_objects[a][i];

        if (ChainValidation.is_object_id(obj)) {
          // An entry containing only an object ID means that object was removed
          // console.log("removed obj", obj);
          // Check if the object exists in the ChainStore
          let old_obj = this.objects_by_id.get(obj);

          if (obj.search(order_prefix) === 0) {
            emitter.emit('cancel-order', obj);
            cancelledOrders.push(obj);

            if (!old_obj) {
              return;
            }

            let account = this.objects_by_id.get(old_obj.get('seller'));

            if (account && account.has('orders')) {
              let limit_orders = account.get('orders');

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

            let account = this.objects_by_id.get(old_obj.get('borrower'));

            if (account && account.has('call_orders')) {
              let call_orders = account.get('call_orders');

              if (account.get('call_orders').has(obj)) {
                account = account.set('call_orders', call_orders.delete(obj));
                this.objects_by_id = this.objects_by_id.set(account.get('id'), account);
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
  }

  notifySubscribers() {
    // Dispatch at most only once every x milliseconds
    if (!this.dispatched) {
      this.dispatched = true;
      this.timeout = setTimeout(() => {
        this.dispatched = false;
        this.subscribers.forEach(callback => callback());
      }, this.dispatchFrequency);
    }
  }

  /**
   *  Add a callback that will be called anytime any object in the cache is updated
   */
  subscribe(callback) {
    if (this.subscribers.has(callback)) {
      console.error('Subscribe callback already exists', callback);
    }

    this.subscribers.add(callback);
  }

  /**
   *  Remove a callback that was previously added via subscribe
   */
  unsubscribe(callback) {
    if (!this.subscribers.has(callback)) {
      console.error('Unsubscribe callback does not exists', callback);
    }

    this.subscribers.delete(callback);
  }

  /** Clear an object from the cache to force it to be fetched again. This may
   * be useful if a query failed the first time and the wallet has reason to believe
   * it may succeede the second time.
   */
  clearObjectCache(id) {
    this.objects_by_id = this.objects_by_id.delete(id);
  }

  /**
   * There are three states an object id could be in:
   *
   * 1. undefined       - returned if a query is pending
   * 3. defined         - return an object
   * 4. null            - query return null
   *
   */
  getObject(id, force = false) {
    if (!ChainValidation.is_object_id(id)) {
      throw Error(`argument is not an object id: ${JSON.stringify(id)}`);
    }

    let result = this.objects_by_id.get(id);

    if (result === undefined || force) {
      return this.fetchObject(id, force);
    }

    if (result === true) {
      return undefined;
    }

    return result;
  }

  getSimpleObjectById(id) {
    return new Promise((success, fail) => {
      if (!ChainValidation.is_object_id(id)) {
        return fail(new Error(`argument is not an object id: ${JSON.stringify(id)}`));
      }

      let result = this.simple_objects_by_id.get(id);

      if (result) {
        return success(result);
      }

      Apis.instance()
        .db_api()
        .exec('get_objects', [[id]])
        .then((objects) => {
          let object = objects[0];

          if (!object) {
            return success(null);
          }

          this.simple_objects_by_id = this.simple_objects_by_id.set(id, object);
          success(object);
        });
    });
  }

  /**
   *  @return undefined if a query is pending
   *  @return null if id_or_symbol has been queired and does not exist
   *  @return object if the id_or_symbol exists
   */
  getAsset(id_or_symbol) {
    if (!id_or_symbol) {
      return null;
    }

    if (ChainValidation.is_object_id(id_or_symbol)) {
      let asset = this.getObject(id_or_symbol);

      if (asset && (asset.get('bitasset') && !asset.getIn(['bitasset', 'current_feed']))) {
        return undefined;
      }

      return asset;
    }

    // / TODO: verify id_or_symbol is a valid symbol name

    let asset_id = this.assets_by_symbol.get(id_or_symbol);

    if (ChainValidation.is_object_id(asset_id)) {
      let asset = this.getObject(asset_id);

      if (asset && (asset.get('bitasset') && !asset.getIn(['bitasset', 'current_feed']))) {
        return undefined;
      }

      return asset;
    }

    if (asset_id === null) {
      return null;
    }

    if (asset_id === true) {
      return undefined;
    }

    Apis.instance()
      .db_api()
      .exec('lookup_asset_symbols', [[id_or_symbol]])
      .then((asset_objects) => {
        if (asset_objects.length && asset_objects[0]) {
          this._updateObject(asset_objects[0], true);
        } else {
          this.assets_by_symbol = this.assets_by_symbol.set(id_or_symbol, null);
          this.notifySubscribers();
        }
      })
      .catch((error) => {
        console.log('Error: ', error);
        this.assets_by_symbol = this.assets_by_symbol.delete(id_or_symbol);
      });

    return undefined;
  }

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
  getAccountRefsOfKey(key) {
    if (this.get_account_refs_of_keys_calls.has(key)) {
      return this.account_ids_by_key.get(key);
    }

    this.get_account_refs_of_keys_calls = this.get_account_refs_of_keys_calls.add(key);
    Apis.instance()
      .db_api()
      .exec('get_key_references', [[key]])
      .then(
        (vec_account_id) => {
          let refs = Immutable.Set();
          vec_account_id = vec_account_id[0];
          refs = refs.withMutations((r) => {
            for (let i = 0; i < vec_account_id.length; ++i) {
              r.add(vec_account_id[i]);
            }
          });
          this.account_ids_by_key = this.account_ids_by_key.set(key, refs);
          this.notifySubscribers();
        },
        () => {
          this.account_ids_by_key = this.account_ids_by_key.delete(key);
          this.get_account_refs_of_keys_calls = this.get_account_refs_of_keys_calls.delete(key);
        }
      );
    return undefined;
  }

  /**
   * @return a Set of balance ids that are claimable with the given address
   * @return undefined if a query is pending and the set is not known at this time
   * @return a empty Set if no items are found
   *
   * If this method returns undefined, then it will send a request to the server for
   * the current state after which it will be subscribed to changes to this set.
   */
  getBalanceObjects(address) {
    let current = this.balance_objects_by_address.get(address);

    if (current === undefined) {
      /** because balance objects are simply part of the genesis state
       * there is no need to worry about having to update them / merge
       * them or index them in updateObject.
       */
      this.balance_objects_by_address = this.balance_objects_by_address.set(
        address,
        Immutable.Set()
      );
      Apis.instance()
        .db_api()
        .exec('get_balance_objects', [[address]])
        .then(
          (balance_objects) => {
            let set = new Set();

            for (let i = 0; i < balance_objects.length; ++i) {
              this._updateObject(balance_objects[i]);
              set.add(balance_objects[i].id);
            }

            this.balance_objects_by_address = this.balance_objects_by_address.set(
              address,
              Immutable.Set(set)
            );
            this.notifySubscribers();
          },
          () => {
            this.balance_objects_by_address = this.balance_objects_by_address.delete(address);
          }
        );
    }

    return this.balance_objects_by_address.get(address);
  }

  /**
   * @return a list of tournament ids for upcoming tournaments
   * @return an empty list if a query is pending and the set is not known at this time
   *         or if there are no upcoming touraments
   *
   * If we have not yet requested tournaments for this account, it will
   * send a request to the server for the current list, after which it
   * will be subscribed to changes to this set.
   */
  getTournamentIdsInState(accountId, stateString) {
    let tournamentIdsForThisAccountAndState;
    let tournamentIdsForThisAccount = this.tournament_ids_by_state.get(accountId);

    if (tournamentIdsForThisAccount === undefined) {
      tournamentIdsForThisAccountAndState = new Immutable.Set();
      tournamentIdsForThisAccount = new Immutable.Map().set(
        stateString,
        tournamentIdsForThisAccountAndState
      );
      this.tournament_ids_by_state = this.tournament_ids_by_state.set(
        accountId,
        tournamentIdsForThisAccount
      );
    } else {
      tournamentIdsForThisAccountAndState = tournamentIdsForThisAccount.get(stateString);

      if (tournamentIdsForThisAccountAndState !== undefined) {
        return tournamentIdsForThisAccountAndState;
      }

      tournamentIdsForThisAccountAndState = new Immutable.Set();
      tournamentIdsForThisAccount = tournamentIdsForThisAccount.set(
        stateString,
        tournamentIdsForThisAccountAndState
      );
      this.tournament_ids_by_state = this.tournament_ids_by_state.set(
        accountId,
        tournamentIdsForThisAccount
      );
    }

    Apis.instance()
      .db_api()
      .exec('get_tournaments_in_state', [stateString, 100])
      .then((tournaments) => {
        let originalTournamentIdsInState = this.tournament_ids_by_state.getIn([
          accountId,
          stateString
        ]);
        // call updateObject on each tournament, which will classify it
        tournaments.forEach((tournament) => {
          /**
           * Fix bug: we cant update tournament_ids_by_state if objects_by_id has a tournament
           */
          if (!originalTournamentIdsInState.get(tournament.id)) {
            this.clearObjectCache(tournament.id);
          }

          this._updateObject(tournament);
        });

        let tournament_id = this.tournament_ids_by_state.getIn([accountId, stateString]);

        if (tournament_id !== originalTournamentIdsInState) {
          this.notifySubscribers();
        }
      });
    return tournamentIdsForThisAccountAndState;
  }

  getRegisteredTournamentIds(accountId) {
    let tournamentIds = this.registered_tournament_ids_by_player.get(accountId);

    if (tournamentIds !== undefined) {
      return tournamentIds;
    }

    tournamentIds = new Immutable.Set();
    this.registered_tournament_ids_by_player = this.registered_tournament_ids_by_player.set(
      accountId,
      tournamentIds
    );

    Apis.instance()
      .db_api()
      .exec('get_registered_tournaments', [accountId, 100])
      .then((registered_tournaments) => {
        let originalTournamentIds = this.registered_tournament_ids_by_player.get(accountId);
        let newTournamentIds = new Immutable.Set(registered_tournaments);

        if (!originalTournamentIds.equals(newTournamentIds)) {
          this.registered_tournament_ids_by_player = this.registered_tournament_ids_by_player.set(
            accountId,
            newTournamentIds
          );
          this.notifySubscribers();
        }
      });

    return tournamentIds;
  }

  /**
   *  If there is not already a pending request to fetch this object, a new
   *  request will be made.
   *
   *  @return null if the object does not exist,
   *  @return undefined if the object might exist but is not in cache
   *  @return the object if it does exist and is in our cache
   */
  fetchObject(id, force = false) {
    if (typeof id !== 'string') {
      let result = [];

      for (let i = 0; i < id.length; ++i) {
        result.push(this.fetchObject(id[i]));
      }

      return result;
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

    if (!ChainValidation.is_object_id(id)) {
      throw Error(`argument is not an object id: ${id}`);
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

    let result = this.objects_by_id.get(id);

    if (result === undefined) {
      // the fetch
      if (DEBUG) {
        console.log('fetching object: ', id);
      }

      this.objects_by_id = this.objects_by_id.set(id, true);
      Apis.instance()
        .db_api()
        .exec('get_objects', [[id]])
        .then((optional_objects) => {
          for (let i = 0; i < optional_objects.length; i++) {
            let optional_object = optional_objects[i];

            if (optional_object) {
              this._updateObject(optional_object, true);
              this.simple_objects_by_id = this.simple_objects_by_id.set(id, optional_object);
            } else {
              this.objects_by_id = this.objects_by_id.set(id, null);
              this.notifySubscribers();
            }
          }
        })
        .catch((error) => {
          // in the event of an error clear the pending state for id
          console.log('!!! Chain API error', error);
          this.objects_by_id = this.objects_by_id.delete(id);
        });
    } else if (result === true) {
      // then we are waiting a response
      return undefined;
    }

    return result; // we have a response, return it
  }

  /**
   *  @return null if no such account exists
   *  @return undefined if such an account may exist,
   *  and fetch the the full account if not already pending
   *  @return the account object if it does exist
   */
  getAccount(name_or_id) {
    if (!name_or_id) {
      return null;
    }

    if (typeof name_or_id === 'object') {
      if (name_or_id.id) {
        return this.getAccount(name_or_id.id);
      }

      if (name_or_id.get) {
        return this.getAccount(name_or_id.get('id'));
      }

      return undefined;
    }

    if (ChainValidation.is_object_id(name_or_id)) {
      let account = this.getObject(name_or_id);

      if (account === null) {
        return null;
      }

      if (account === undefined || account.get('name') === undefined) {
        return this.fetchFullAccount(name_or_id);
      }

      return account;
    }

    if (ChainValidation.is_account_name(name_or_id, true)) {
      let account_id = this.accounts_by_name.get(name_or_id);

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
  }

  /**
   * This method will attempt to lookup witness by account_id.
   * If witness doesn't exist it will return null,
   * if witness is found it will return witness object,
   * if it's not fetched yet it will return undefined.
   * @param account_id - account id
   */
  getWitnessById(account_id) {
    let witness_id = this.witness_by_account_id.get(account_id);

    if (witness_id === undefined) {
      this.fetchWitnessByAccount(account_id);
      return undefined;
    }

    if (witness_id) {
      this._subTo('witnesses', witness_id);
    }

    return witness_id ? this.getObject(witness_id) : null;
  }

  /**
   * This method will attempt to lookup witness by account_id.
   * If witness doesn't exist it will return null,
   * if witness is found it will return witness object,
   * if it's not fetched yet it will return undefined.
   * @param witness_id - witness id
   */
  getWitnessAccount(witness_id) {
    return new Promise((success) => {
      let account = this.account_by_witness_id.get(witness_id);

      if (account) {
        return success(account);
      }

      this.getSimpleObjectById(witness_id).then((witness) => {
        this.getSimpleObjectById(witness.witness_account).then((fetched_account) => {
          this.account_by_witness_id = this.account_by_witness_id.set(witness_id, fetched_account);
          success(fetched_account);
        });
      });
    });
  }

  /**
   * This method will attempt to lookup committee member by account_id.
   * If committee member doesn't exist it will return null,
   * if committee member is found it will return committee member object,
   * if it's not fetched yet it will return undefined.
   * @param account_id - account id
   */
  getCommitteeMemberById(account_id) {
    let cm_id = this.committee_by_account_id.get(account_id);

    if (cm_id === undefined) {
      this.fetchCommitteeMemberByAccount(account_id);
      return undefined;
    }

    if (cm_id) {
      this._subTo('committee', cm_id);
    }

    return cm_id ? this.getObject(cm_id) : null;
  }

  /**
   * Obsolete! Please use getWitnessById
   * This method will attempt to lookup the account, and then query to see whether or not there is
   * a witness for this account. If the answer is known, it will return the witness_object,
   * otherwise it will attempt to look it up and return null. Once the lookup has completed
   * on_update will be called.
   *
   * @param id_or_account may either be an account_id, a witness_id, or an account_name
   */
  getWitness(id_or_account) {
    console.log('DEPRECATED call to getWitness, use getWitnessById instead.');
    let account = this.getAccount(id_or_account);

    if (!account) {
      return null;
    }

    let account_id = account.get('id');

    let witness_id = this.witness_by_account_id.get(account_id);

    if (witness_id === undefined) {
      this.fetchWitnessByAccount(account_id);
    }

    return this.getObject(witness_id);
  }

  // Obsolete! Please use getCommitteeMemberById
  getCommitteeMember(id_or_account, on_update = null) {
    console.log('DEPRECATED call to getCommitteeMember, use getCommitteeMemberById instead.');

    let is_account = ChainValidation.is_account_name(id_or_account, true);

    if (is_account || id_or_account.substring(0, 4) === '1.2.') {
      let account = this.getAccount(id_or_account);

      if (!account) {
        this.lookupAccountByName(id_or_account).then(
          (lookup_account) => {
            let account_id = lookup_account.get('id');
            let committee_id = this.committee_by_account_id.get(account_id);

            if (ChainValidation.is_object_id(committee_id)) {
              return this.getObject(committee_id, on_update);
            }

            if (committee_id === undefined) {
              this.fetchCommitteeMemberByAccount(account_id).then((committee) => {
                this.committee_by_account_id.set(
                  account_id,
                  committee ? committee.get('id') : null
                );

                if (on_update && committee) {
                  on_update();
                }
              });
            }
          },
          () => {
            this.committee_by_account_id.set(id_or_account, null);
          }
        );
      } else {
        let account_id = account.get('id');
        let committee_id = this.committee_by_account_id.get(account_id);

        if (ChainValidation.is_object_id(committee_id)) {
          return this.getObject(committee_id, on_update);
        }

        if (committee_id === undefined) {
          this.fetchCommitteeMemberByAccount(account_id).then((committee) => {
            this.committee_by_account_id.set(account_id, committee ? committee.get('id') : null);

            if (on_update && committee) {
              on_update();
            }
          });
        }
      }
    }

    return null;
  }

  /**
   *
   * @return a promise with the witness object
   */
  fetchWitnessByAccount(account_id) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_witness_by_account', [account_id])
        .then((optional_witness_object) => {
          if (optional_witness_object) {
            this._subTo('witnesses', optional_witness_object.id);
            this.witness_by_account_id = this.witness_by_account_id.set(
              optional_witness_object.witness_account,
              optional_witness_object.id
            );
            let witness_object = this._updateObject(optional_witness_object, true);
            resolve(witness_object);
          } else {
            this.witness_by_account_id = this.witness_by_account_id.set(account_id, null);
            this.notifySubscribers();
            resolve(null);
          }
        }, reject);
    });
  }

  /**
   *
   * @return a promise with the witness object
   */
  fetchCommitteeMemberByAccount(account_id) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_committee_member_by_account', [account_id])
        .then((optional_committee_object) => {
          if (optional_committee_object) {
            this._subTo('committee', optional_committee_object.id);
            this.committee_by_account_id = this.committee_by_account_id.set(
              optional_committee_object.committee_member_account,
              optional_committee_object.id
            );
            let committee_object = this._updateObject(optional_committee_object, true);
            resolve(committee_object);
          } else {
            this.committee_by_account_id = this.committee_by_account_id.set(account_id, null);
            this.notifySubscribers();
            resolve(null);
          }
        }, reject);
    });
  }

  /**
   *  Fetches an account and all of its associated data in a single query
   *
   *  @param an account name or account id
   *
   *  @return undefined if the account in question is in the process of being fetched
   *  @return the object if it has already been fetched
   *  @return null if the object has been queried and was not found
   */
  fetchFullAccount(name_or_id) {
    if (DEBUG) {
      console.log('Fetch full account: ', name_or_id);
    }

    let fetch_account = false;

    if (ChainValidation.is_object_id(name_or_id)) {
      let current = this.objects_by_id.get(name_or_id);
      fetch_account = current === undefined;

      if (!fetch_account && fetch_account.get('name')) {
        return current;
      }
    } else {
      if (!ChainValidation.is_account_name(name_or_id, true)) {
        throw Error(`argument is not an account name: ${name_or_id}`);
      }

      let account_id = this.accounts_by_name.get(name_or_id);

      if (ChainValidation.is_object_id(account_id)) {
        return this.getAccount(account_id);
      }
    }

    // / only fetch once every 5 seconds if it wasn't found
    if (
      !this.fetching_get_full_accounts.has(name_or_id)
      || Date.now() - this.fetching_get_full_accounts.get(name_or_id) > 5000
    ) {
      this.fetching_get_full_accounts.set(name_or_id, Date.now());
      // console.log( "FETCHING FULL ACCOUNT: ", name_or_id )
      Apis.instance()
        .db_api()
        .exec('get_full_accounts', [[name_or_id], true])
        .then(
          (results) => {
            if (results.length === 0) {
              if (ChainValidation.is_object_id(name_or_id)) {
                this.objects_by_id = this.objects_by_id.set(name_or_id, null);
                this.notifySubscribers();
              }

              return;
            }

            let full_account = results[0][1];

            if (DEBUG) {
              console.log('full_account: ', full_account);
            }

            this._subTo('accounts', full_account.account.id);

            let {
              account,
              vesting_balances,
              pending_dividend_payments,
              statistics,
              call_orders,
              limit_orders,
              referrer_name,
              registrar_name,
              lifetime_referrer_name,
              votes,
              proposals
            } = full_account;

            this.accounts_by_name = this.accounts_by_name.set(account.name, account.id);
            account.referrer_name = referrer_name;
            account.lifetime_referrer_name = lifetime_referrer_name;
            account.registrar_name = registrar_name;
            account.balances = {};
            account.orders = new Immutable.Set();
            account.vesting_balances = new Immutable.Set();
            account.pending_dividend_payments = new Immutable.Set();
            account.balances = new Immutable.Map();
            account.call_orders = new Immutable.Set();
            account.proposals = new Immutable.Set();
            account.vesting_balances = account.vesting_balances.withMutations((set) => {
              vesting_balances.forEach((vb) => {
                this._updateObject(vb);
                set.add(vb.id);
              });
            });

            let sub_to_objects = [];

            votes.forEach(v => this._updateObject(v));

            account.balances = account.balances.withMutations((map) => {
              full_account.balances.forEach((b) => {
                this._updateObject(b);
                map.set(b.asset_type, b.id);
                sub_to_objects.push(b.id);
              });
            });

            account.orders = account.orders.withMutations((set) => {
              limit_orders.forEach((order) => {
                this._updateObject(order);
                set.add(order.id);
                sub_to_objects.push(order.id);
              });
            });

            account.pending_dividend_payments = account.pending_dividend_payments.withMutations(
              (set) => {
                pending_dividend_payments.forEach((payments) => {
                  this._updateObject(payments);
                  set.add(payments);
                  sub_to_objects.push(payments.id);
                });
              }
            );

            account.call_orders = account.call_orders.withMutations((set) => {
              call_orders.forEach((co) => {
                this._updateObject(co);
                set.add(co.id);
                sub_to_objects.push(co.id);
              });
            });

            account.proposals = account.proposals.withMutations((set) => {
              proposals.forEach((p) => {
                this._updateObject(p);
                set.add(p.id);
                sub_to_objects.push(p.id);
              });
            });

            if (sub_to_objects.length) {
              Apis.instance()
                .db_api()
                .exec('get_objects', [sub_to_objects]);
            }

            this._updateObject(statistics);
            let updated_account = this._updateObject(account);
            this.fetchRecentHistory(updated_account);
            this.notifySubscribers();
          },
          (error) => {
            console.log('Error: ', error);

            if (ChainValidation.is_object_id(name_or_id)) {
              this.objects_by_id = this.objects_by_id.delete(name_or_id);
            } else {
              this.accounts_by_name = this.accounts_by_name.delete(name_or_id);
            }
          }
        );
    }

    return undefined;
  }

  static getAccountMemberStatus(account) {
    if (account === undefined) {
      return undefined;
    }

    if (account === null) {
      return 'unknown';
    }

    if (account.get('lifetime_referrer') === account.get('id')) {
      return 'lifetime';
    }

    let exp = new Date(account.get('membership_expiration_date')).getTime();
    let now = new Date().getTime();

    if (exp < now) {
      return 'basic';
    }

    return 'annual';
  }

  getAccountBalance(account, asset_type) {
    let balances = account.get('balances');

    if (!balances) {
      return 0;
    }

    let balance_obj_id = balances.get(asset_type);

    if (balance_obj_id) {
      let bal_obj = this.objects_by_id.get(balance_obj_id);

      if (bal_obj) {
        return bal_obj.get('balance');
      }
    }

    return 0;
  }

  /**
   * There are two ways to extend the account history, add new more
   * recent history, and extend historic hstory. This method will fetch
   * the most recent account history and prepend it to the list of
   * historic operations.
   *
   *  @param account immutable account object
   *  @return a promise with the account history
   */
  fetchRecentHistory(account, limit = 100) {
    let account_id = account;

    if (!ChainValidation.is_object_id(account_id) && account.toJS) {
      account_id = account.get('id');
    }

    if (!ChainValidation.is_object_id(account_id)) {
      return;
    }

    account = this.objects_by_id.get(account_id);

    if (!account) {
      return;
    }

    let pending_request = this.account_history_requests.get(account_id);

    if (pending_request) {
      pending_request.requests++;
      return pending_request.promise;
    }

    pending_request = {requests: 0};

    let most_recent = `1.${op_history}.0`;
    let history = account.get('history');

    if (history && history.size) {
      most_recent = history.first().get('id');
    }

    // / starting at 0 means start at NOW, set this to something other than 0
    // / to skip recent transactions and fetch the tail
    let start = `1.${op_history}.0`;

    pending_request.promise = new Promise((resolve, reject) => {
      Apis.instance()
        .history_api()
        .exec('get_account_history', [account_id, most_recent, limit, start])
        .then((operations) => {
          let current_account = this.objects_by_id.get(account_id);
          let current_history = current_account.get('history');

          if (!current_history) {
            current_history = Immutable.List();
          }

          let updated_history = Immutable.fromJS(operations);
          updated_history = updated_history.withMutations((list) => {
            for (let i = 0; i < current_history.size; ++i) {
              list.push(current_history.get(i));
            }
          });
          let updated_account = current_account.set('history', updated_history);
          this.objects_by_id = this.objects_by_id.set(account_id, updated_account);

          let request = this.account_history_requests.get(account_id);
          this.account_history_requests.delete(account_id);

          if (request.requests > 0) {
            // it looks like some more history may have come in while we were
            // waiting on the result, lets fetch anything new before we resolve
            // this query.
            this.fetchRecentHistory(updated_account, limit).then(resolve, reject);
          } else {
            resolve(updated_account);
          }
        }); // end then
    });

    this.account_history_requests.set(account_id, pending_request);
    return pending_request.promise;
  }

  /**
   * @brief Get a list of all sports
   */

  static getSportsList() {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('list_sports', [])
        .then((sportsList) => {
          if (sportsList) {
            resolve(sportsList);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  /**
   * @brief Return a list of all event groups for a sport (e.g. all soccer leagues in soccer)
   */

  getEventGroupsList(sportId) {
    let eventGroupsList = this.event_groups_list_by_sport_id.get(sportId);

    if (eventGroupsList === undefined) {
      this.event_groups_list_by_sport_id = this.event_groups_list_by_sport_id.set(
        sportId,
        Immutable.Set()
      );

      Apis.instance()
        .db_api()
        .exec('list_event_groups', [sportId])
        .then(
          (eventGroups) => {
            let set = new Set();

            for (let i = 0, len = eventGroups.length; i < len; ++i) {
              set.add(eventGroups[i]);
            }

            this.event_groups_list_by_sport_id = this.event_groups_list_by_sport_id.set(
              sportId,
              Immutable.Set(set)
            );
            this.notifySubscribers();
          },
          () => {
            this.event_groups_list_by_sport_id = this.event_groups_list_by_sport_id.delete(sportId);
          }
        );
    }

    return this.event_groups_list_by_sport_id.get(sportId);
  }

  /**
   * @brief Return a list of all betting market groups for an event
   */

  getBettingMarketGroupsList(eventId) {
    let bettingMarketGroupsList = this.betting_market_groups_list_by_sport_id.get(eventId);

    if (bettingMarketGroupsList === undefined) {
      this.betting_market_groups_list_by_sport_id = this.betting_market_groups_list_by_sport_id.set(
        eventId,
        Immutable.Set()
      );

      Apis.instance()
        .db_api()
        .exec('list_betting_market_groups', [eventId])
        .then(
          (bettingMarketGroups) => {
            let set = new Set();

            for (let i = 0, len = bettingMarketGroups.length; i < len; ++i) {
              set.add(bettingMarketGroups[i]);
            }

            this.betting_market_groups_list_by_sport_id = this.betting_market_groups_list_by_sport_id.set( // eslint-disable-line
              eventId,
              Immutable.Set(set)
            );
            this.notifySubscribers();
          },
          () => {
            this.betting_market_groups_list_by_sport_id = this.betting_market_groups_list_by_sport_id.delete( // eslint-disable-line
              eventId
            );
          }
        );
    }

    return this.betting_market_groups_list_by_sport_id.get(eventId);
  }

  /**
   * @brief Return a list of all betting markets for a betting market group
   */

  getBettingMarketsList(bettingMarketGroupId) {
    let bettingMarketsList = this.betting_markets_list_by_sport_id.get(bettingMarketGroupId);

    if (bettingMarketsList === undefined) {
      this.betting_markets_list_by_sport_id = this.betting_markets_list_by_sport_id.set(
        bettingMarketGroupId,
        Immutable.Set()
      );

      Apis.instance()
        .db_api()
        .exec('list_betting_markets', [bettingMarketGroupId])
        .then(
          (bettingMarkets) => {
            let set = new Set();

            for (let i = 0, len = bettingMarkets.length; i < len; ++i) {
              set.add(bettingMarkets[i]);
            }

            this.betting_markets_list_by_sport_id = this.betting_markets_list_by_sport_id.set(
              bettingMarketGroupId,
              Immutable.Set(set)
            );
            this.notifySubscribers();
          },
          () => {
            this.betting_markets_list_by_sport_id = this.betting_markets_list_by_sport_id.delete(
              bettingMarketGroupId
            );
          }
        );
    }

    return this.betting_markets_list_by_sport_id.get(bettingMarketGroupId);
  }

  /**
   * @brief Get global betting statistics
   */

  static getGlobalBettingStatistics() {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_global_betting_statistics', [])
        .then((getGlobalBettingStatistics) => {
          if (getGlobalBettingStatistics) {
            resolve(getGlobalBettingStatistics);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getBinnedOrderBook(betting_market_id, precision) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .bookie_api()
        .exec('get_binned_order_book', [betting_market_id, precision])
        .then((order_book_object) => {
          if (order_book_object) {
            resolve(order_book_object);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getTotalMatchedBetAmountForBettingMarketGroup(group_id) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .bookie_api()
        .exec('get_total_matched_bet_amount_for_betting_market_group', [group_id])
        .then((total_matched_bet_amount) => {
          if (total_matched_bet_amount) {
            resolve(total_matched_bet_amount);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getEventsContainingSubString(sub_string, language) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .bookie_api()
        .exec('get_events_containing_sub_string', [sub_string, language])
        .then((events_containing_sub_string) => {
          if (events_containing_sub_string) {
            resolve(events_containing_sub_string);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getUnmatchedBetsForBettor(betting_market_id_type, account_id_type) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_unmatched_bets_for_bettor', [betting_market_id_type, account_id_type])
        .then((unmatched_bets_for_bettor) => {
          if (unmatched_bets_for_bettor) {
            resolve(unmatched_bets_for_bettor);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static listEventsInGroup(event_group_id) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('list_events_in_group', [event_group_id])
        .then((events_in_group) => {
          if (events_in_group) {
            resolve(events_in_group);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getAllUnmatchedBetsForBettor(account_id_type) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .db_api()
        .exec('get_all_unmatched_bets_for_bettor', [account_id_type])
        .then((all_unmatched_bets_for_bettor) => {
          if (all_unmatched_bets_for_bettor) {
            resolve(all_unmatched_bets_for_bettor);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getMatchedBetsForBettor(bettor_id) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .bookie_api()
        .exec('get_matched_bets_for_bettor', [bettor_id])
        .then((matched_bets_for_bettor) => {
          if (matched_bets_for_bettor) {
            resolve(matched_bets_for_bettor);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

  static getAllMatchedBetsForBettor(bettor_id, start, limit = 1000) {
    return new Promise((resolve, reject) => {
      Apis.instance()
        .bookie_api()
        .exec('get_all_matched_bets_for_bettor', [bettor_id, start, limit])
        .then((all_matched_bets_for_bettor) => {
          if (all_matched_bets_for_bettor) {
            resolve(all_matched_bets_for_bettor);
          } else {
            resolve(null);
          }
        }, reject);
    });
  }

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
  _updateObject(object, notify_subscribers = false, emit = true) {
    if (!('id' in object)) {
      console.log('object with no id:', object);

      if ('balance' in object && 'owner' in object && 'settlement_date' in object) {
        // Settle order object
        emitter.emit('settle-order-update', object);
      }

      return;
    }

    let objectSpace = object.id.split('.').slice(0, -1);
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
      object.participation = 100 * (BigInteger(object.recent_slots_filled).bitCount() / 128.0);
      this.head_block_time_string = object.time;
      this.chain_time_offset.push(Date.now() - ChainStore.timeStringToDate(object.time).getTime());

      if (this.chain_time_offset.length > 10) {
        this.chain_time_offset.shift(); // remove first
      }

      this.fetchRecentOperations(object.head_block_number);
    }

    let current = this.objects_by_id.get(object.id, undefined);

    if (current === undefined || current === true) {
      current = Immutable.Map();
    }

    let prior = current;

    if (current === undefined || current === true) {
      this.objects_by_id = this.objects_by_id.set(object.id, (current = Immutable.fromJS(object)));
    } else {
      this.objects_by_id = this.objects_by_id.set(
        object.id,
        (current = current.mergeDeep(Immutable.fromJS(object)))
      );
    }

    // BALANCE OBJECT
    if (objectSpace === balance_prefix) {
      let owner = this.objects_by_id.get(object.owner);

      if (owner === undefined || owner === null) {
        return;
        /*  This prevents the full account from being looked up later
            owner = {id:object.owner, balances:{ } }
            owner.balances[object.asset_type] = object.id
            owner = Immutable.fromJS( owner )
            */
      }

      let balances = owner.get('balances');

      if (!balances) {
        owner = owner.set('balances', Immutable.Map());
      }

      owner = owner.setIn(['balances', object.asset_type], object.id);

      this.objects_by_id = this.objects_by_id.set(object.owner, owner);
    } else if (objectSpace === account_stats_prefix) {
      // ACCOUNT STATS OBJECT
      // console.log( "HISTORY CHANGED" )
      let prior_most_recent_op = prior ? prior.get('most_recent_op') : '2.9.0';

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
      current = current.set('active', Immutable.fromJS(object.active));
      current = current.set('owner', Immutable.fromJS(object.owner));
      current = current.set('options', Immutable.fromJS(object.options));
      current = current.set(
        'pending_dividend_payments',
        Immutable.fromJS(object.pending_dividend_payments)
      );
      current = current.set(
        'whitelisting_accounts',
        Immutable.fromJS(object.whitelisting_accounts)
      );
      current = current.set(
        'blacklisting_accounts',
        Immutable.fromJS(object.blacklisting_accounts)
      );
      current = current.set('whitelisted_accounts', Immutable.fromJS(object.whitelisted_accounts));
      current = current.set('blacklisted_accounts', Immutable.fromJS(object.blacklisted_accounts));
      this.objects_by_id = this.objects_by_id.set(object.id, current);
      this.accounts_by_name = this.accounts_by_name.set(object.name, object.id);
    } else if (objectSpace === asset_prefix) {
      // ASSET OBJECT
      this.assets_by_symbol = this.assets_by_symbol.set(object.symbol, object.id);
      let dynamic = current.get('dynamic');

      if (!dynamic) {
        let dad = this.getObject(object.dynamic_asset_data_id, true);

        if (!dad) {
          dad = Immutable.Map();
        }

        if (!dad.get('asset_id')) {
          dad = dad.set('asset_id', object.id);
        }

        this.objects_by_id = this.objects_by_id.set(object.dynamic_asset_data_id, dad);

        current = current.set('dynamic', dad);
        this.objects_by_id = this.objects_by_id.set(object.id, current);
      }

      let bitasset = current.get('bitasset');

      if (!bitasset && object.bitasset_data_id) {
        let bad = this.getObject(object.bitasset_data_id, true);

        if (!bad) {
          bad = Immutable.Map();
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
      let asset_id = current.get('asset_id');

      if (asset_id) {
        let asset_obj = this.getObject(asset_id);

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
      let asset_id = current.get('asset_id');

      if (asset_id) {
        let asset = this.getObject(asset_id);

        if (asset) {
          asset = asset.set('bitasset', current);
          emitter.emit('bitasset-update', asset);
          this.objects_by_id = this.objects_by_id.set(asset_id, asset);
        }
      }
    } else if (objectSpace === call_order_prefix) {
      // CALL ORDER OBJECT
      // Update nested call_orders inside account object
      if (emit) {
        emitter.emit('call-order-update', object);
      }

      let account = this.objects_by_id.get(object.borrower);

      if (account && account.has('call_orders')) {
        let call_orders = account.get('call_orders');

        if (!call_orders.has(object.id)) {
          account = account.set('call_orders', call_orders.add(object.id));
          this.objects_by_id = this.objects_by_id.set(account.get('id'), account);
          // Force subscription to the object in the witness node by calling get_objects
          Apis.instance()
            .db_api()
            .exec('get_objects', [[object.id]]);
        }
      }
    } else if (objectSpace === order_prefix) {
      // LIMIT ORDER OBJECT
      let account = this.objects_by_id.get(object.seller);

      if (account && account.has('orders')) {
        let limit_orders = account.get('orders');

        if (!limit_orders.has(object.id)) {
          account = account.set('orders', limit_orders.add(object.id));
          this.objects_by_id = this.objects_by_id.set(account.get('id'), account);
          // Force subscription to the object in the witness node by calling get_objects
          Apis.instance()
            .db_api()
            .exec('get_objects', [[object.id]]);
        }
      }
    } else if (objectSpace === proposal_prefix) {
      // PROPOSAL OBJECT
      this.addProposalData(object.required_active_approvals, object.id);
      this.addProposalData(object.required_owner_approvals, object.id);
    } else if (objectSpace === tournament_prefix) {
      // TOURNAMENT OBJECT
      let priorState = prior.get('state');
      let newState = current.get('state');

      if (priorState !== newState) {
        this.tournament_ids_by_state = this.tournament_ids_by_state
          .map((stateMap, accountId) => stateMap.map((tournamentIdSet, stateString) => {
            if (stateString === priorState) {
              return tournamentIdSet.remove(object.id);
            }

            if (
              stateString === newState
                && (accountId === null
                  || current.getIn(['options', 'whitelist']).isEmpty()
                  || current.getIn(['options', 'whitelist']).includes(accountId))
            ) {
              return tournamentIdSet.add(object.id);
            }

            return tournamentIdSet;
          }));
      }

      if (this.last_tournament_id !== undefined) {
        this.setLastTournamentId(current.get('id'));
      }
    } else if (objectSpace === tournament_details_prefix) {
      let priorRegisteredPlayers = prior.get('registered_players');
      let newRegisteredPlayers = current.get('registered_players');

      if (priorRegisteredPlayers !== newRegisteredPlayers) {
        this.registered_tournament_ids_by_player = this.registered_tournament_ids_by_player.map(
          (tournamentIdsSet, accountId) => {
            if (newRegisteredPlayers.includes(accountId)) {
              return tournamentIdsSet.add(current.get('tournament_id'));
            }

            return tournamentIdsSet;

            // currently, you can't un-register for a tournament, so we don't have
            // to deal with removing from a list
          }
        );
      }
    }

    if (notify_subscribers) {
      this.notifySubscribers();
    }

    return current;
  }

  setLastTournamentId(current_tournament_id) {
    if (current_tournament_id === null) {
      if (!this.last_tournament_id) {
        this.last_tournament_id = current_tournament_id;
      }
    } else {
      let current_short_string = current_tournament_id.substring(tournament_prefix.length);
      let current_short = parseFloat(current_short_string);

      let last_short = -1;

      if (this.last_tournament_id) {
        last_short = parseFloat(this.last_tournament_id.substring(tournament_prefix.length));
      }

      if (current_short > last_short) {
        this.last_tournament_id = current_tournament_id;
      }
    }
  }

  getTournaments(last_tournament_id, limit = 5, start_tournament_id) {
    return Apis.instance()
      .db_api()
      .exec('get_tournaments', [last_tournament_id, limit, start_tournament_id])
      .then((tournaments) => {
        let list = Immutable.List();

        this.setLastTournamentId(null);

        if (tournaments && tournaments.length) {
          list = list.withMutations((l) => {
            tournaments.forEach((tournament) => {
              if (!this.objects_by_id.has(tournament.id)) {
                this._updateObject(tournament);
              }

              l.unshift(this.objects_by_id.get(tournament.id));
            });
          });
        }

        return list;
      });
  }

  getLastTournamentId() {
    return new Promise((resolve) => {
      if (this.last_tournament_id === undefined) {
        Apis.instance()
          .db_api()
          .exec('get_tournaments', [`${tournament_prefix}0`, 1, `${tournament_prefix}0`])
          .then((tournaments) => {
            this.setLastTournamentId(null);

            if (tournaments && tournaments.length) {
              tournaments.forEach((tournament) => {
                this._updateObject(tournament);
              });
            }

            resolve(this.last_tournament_id);
          });
      } else {
        resolve(this.last_tournament_id);
      }
    });
  }

  getObjectsByVoteIds(vote_ids) {
    let result = [];
    let missing = [];

    for (let i = 0; i < vote_ids.length; ++i) {
      let obj = this.objects_by_vote_id.get(vote_ids[i]);

      if (obj) {
        result.push(this.getObject(obj));
      } else {
        result.push(null);
        missing.push(vote_ids[i]);
      }
    }

    if (missing.length) {
      // we may need to fetch some objects
      Apis.instance()
        .db_api()
        .exec('lookup_vote_ids', [missing])
        .then(
          (vote_obj_array) => {
            console.log('missing ===========> ', missing);
            console.log('vote objects ===========> ', vote_obj_array);

            for (let i = 0; i < vote_obj_array.length; ++i) {
              if (vote_obj_array[i]) {
                this._updateObject(vote_obj_array[i]);
              }
            }
          },
          error => console.log('Error looking up vote ids: ', error)
        );
    }

    return result;
  }

  getObjectByVoteID(vote_id) {
    let obj_id = this.objects_by_vote_id.get(vote_id);

    if (obj_id) {
      return this.getObject(obj_id);
    }

    return undefined;
  }

  getHeadBlockDate() {
    return ChainStore.timeStringToDate(this.head_block_time_string);
  }

  getEstimatedChainTimeOffset() {
    if (this.chain_time_offset.length === 0) {
      return 0;
    }

    // Immutable is fast, sorts numbers correctly, and leaves the original unmodified
    // This will fix itself if the user changes their clock
    let median_offset = Immutable.List(this.chain_time_offset)
      .sort()
      .get(Math.floor((this.chain_time_offset.length - 1) / 2));
    // console.log("median_offset", median_offset)
    return median_offset;
  }

  addProposalData(approvals, objectId) {
    approvals.forEach((id) => {
      let impactedAccount = this.objects_by_id.get(id);

      if (impactedAccount) {
        let proposals = impactedAccount.get('proposals');

        if (!proposals.includes(objectId)) {
          proposals = proposals.add(objectId);
          impactedAccount = impactedAccount.set('proposals', proposals);
          this._updateObject(impactedAccount.toJS());
        }
      }
    });
  }

  static timeStringToDate(time_string) {
    if (!time_string) {
      return new Date('1970-01-01T00:00:00.000Z');
    }

    // does not end in Z
    if (!/Z$/.test(time_string)) {
      // https://github.com/cryptonomex/graphene/issues/368
      time_string += 'Z';
    }

    return new Date(time_string);
  }

  __getBlocksForScan(lastBlock) {
    let db_api = Apis.instance().db_api();
    return new Promise((success) => {
      let scanToBlock = this.last_processed_block;

      if (lastBlock) {
        return success({lastBlock, scanToBlock});
      }

      db_api.exec('get_dynamic_global_properties', []).then((globalProperties) => {
        this.last_processed_block = globalProperties.head_block_number;
        scanToBlock = globalProperties.head_block_number - 2000;
        scanToBlock = scanToBlock < 0 ? 1 : scanToBlock;
        return success({
          lastBlock: this.last_processed_block,
          scanToBlock
        });
      });
    });
  }

  __bindBlock(lastBlock, scanToBlock, isInit) {
    let db_api = Apis.instance().db_api();
    return new Promise((success) => {
      db_api.exec('get_block', [lastBlock]).then((block) => {
        block.id = lastBlock;

        if (typeof block.timestamp === 'string') {
          block.timestamp += '+00:00';
        }

        block.timestamp = new Date(block.timestamp);
        this.getWitnessAccount(block.witness).then((witness) => {
          block.witness_account_name = witness.name;

          if (!this.recent_blocks_by_id.get(lastBlock)) {
            this.recent_blocks_by_id = this.recent_blocks_by_id.set(lastBlock, block);

            if (this.last_processed_block < lastBlock) {
              this.last_processed_block = lastBlock;
            }

            if (!isInit) {
              this.recent_blocks = this.recent_blocks.unshift(block);

              if (this.recent_blocks.size > block_stack_size) {
                this.recent_blocks = this.recent_blocks.pop();
              }
            } else if (this.recent_blocks.size < block_stack_size) {
              this.recent_blocks = this.recent_blocks.push(block);
            }

            block.transactions.forEach(tx => tx.operations.forEach((op) => {
              op[1].block_id = lastBlock;
              op[1].created_at = block.timestamp;

              if (!isInit) {
                this.recent_operations = this.recent_operations.unshift(op);
              } else {
                if (this.recent_operations.size < operations_stack_size) {
                  this.recent_operations = this.recent_operations.push(op);
                }

                if (
                  this.recent_operations.size >= operations_stack_size
                    && this.recent_blocks.size >= block_stack_size
                ) {
                  scanToBlock = lastBlock;
                }
              }

              if (this.recent_operations.size > operations_stack_size) {
                this.recent_operations = this.recent_operations.pop();
              }
            }));
          }

          lastBlock--;

          if (lastBlock <= scanToBlock) {
            return success();
          }

          this.__bindBlock(lastBlock, scanToBlock, isInit).then(() => success());
        });
      });
    });
  }

  fetchRecentOperations(lastBlock = null) {
    if (lastBlock && !this.last_processed_block) {
      return;
    }

    let isInit = !lastBlock;

    this.__getBlocksForScan(lastBlock).then(({lastBlock: last, scanToBlock}) => {
      this.__bindBlock(last, scanToBlock, isInit).then(() => {
        if (isInit) {
          this.store_initialized = true;
        }
      });
    });
  }

  getRecentBlocks() {
    return this.recent_blocks;
  }

  getRecentOperations() {
    if (!this.store_initialized) {
      return Immutable.List();
    }

    return this.recent_operations;
  }
}

const chain_store = new ChainStore();

function FetchChainObjects(method, object_ids, timeout) {
  let get_object = method.bind(chain_store);

  return new Promise((resolve, reject) => {
    let timeout_handle = null;

    function onUpdate(not_subscribed_yet = false) {
      let res = object_ids.map(id => get_object(id));

      if (res.findIndex(o => o === undefined) === -1) {
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

    let resolved = onUpdate(true);

    if (!resolved) {
      chain_store.subscribe(onUpdate);
    }

    if (timeout && !resolved) {
      timeout_handle = setTimeout(() => {
        chain_store.unsubscribe(onUpdate);
        reject(new Error('timeout'));
      }, timeout);
    }
  });
}

chain_store.FetchChainObjects = FetchChainObjects;

function FetchChain(methodName, objectIds, timeout = 1900) {
  let method = chain_store[methodName];

  if (!method) {
    throw new Error(`ChainStore does not have method ${methodName}`);
  }

  let arrayIn = Array.isArray(objectIds);

  if (!arrayIn) {
    objectIds = [objectIds];
  }

  return chain_store
    .FetchChainObjects(method, Immutable.List(objectIds), timeout)
    .then(res => (arrayIn ? res : res.get(0)));
}

chain_store.FetchChain = FetchChain;

export default chain_store;
