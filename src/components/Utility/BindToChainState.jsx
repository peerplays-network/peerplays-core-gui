/* eslint-disable no-unused-vars */
import React from 'react';
import {curry, flow, reject, clone, toPairs, omit, get, pick} from 'lodash';
import {ChainStore} from 'peerplaysjs-lib';
import ChainTypes from './ChainTypes';
import utils from '../../common/utils';
import LoadingIndicator from '../LoadingIndicator';

/**
 * @brief provides automatic fetching and updating of chain data
 *
 * After applying this decorator to component any property of a type from ChainTypes
 * specified in component's propTypes will be automatically converted from object or account id
 * into a state object that is either undefined, null or an Immutable object.   The
 * Immutable object will automatically be updated anytime it changes on the
 * blockchain.
 *
 * Example:
 *
 * @BindToChainState()
 * class Balance {
 *    static propTypes = {
 *        balance: ChainTypes.ChainObject.isRequired
 *    }
 *    render() {
 *        let amount = Number(this.props.balance.get('balance'));
 *        let type = this.props.balance.get('asset_type');
 *        return (<FormattedAsset amount={amount} asset={type}/>);
 *    }
 * }
 *
 * <Balance balance="1.5.3"/>
 */

const arrayElement = (elementNumber, array) => array[elementNumber];
const firstEl = curry(arrayElement)(0);
const secondEl = curry(arrayElement)(1);
const checkChainType = curry( (chainType, t) => t === chainType || t === chainType.isRequired );
const isObjectType = checkChainType(ChainTypes.ChainObject);
const isAccountType = checkChainType(ChainTypes.ChainAccount);
const isKeyRefsType = checkChainType(ChainTypes.ChainKeyRefs);
const isAddressBalancesType = checkChainType(ChainTypes.ChainAddressBalances);
const isAssetType = checkChainType(ChainTypes.ChainAsset);
const isObjectsListType = checkChainType(ChainTypes.ChainObjectsList);
const isAccountsListType = checkChainType(ChainTypes.ChainAccountsList);
const isAssetsListType = checkChainType(ChainTypes.ChainAssetsList);

function checkIfRequired(t) {
  for (const k in ChainTypes) {
    const v = ChainTypes[k];

    if (t === v.isRequired) {
      return true;
    }
  }

  return false;
}

function BindToChainState(options) {
  return function (Component) {

    return class Wrapper extends React.Component {
      constructor(props) {
        super(props);
        // eslint-disable-next-line react/forbid-foreign-prop-types
        const propTypesArray = toPairs(Component.propTypes); // TODO: deprecate proptypes from another component

        if (options && options.all_props) {
          this.chain_objects = reject(
            Object.keys(this.props),
            (e) => e === 'children' || e === 'keep_updating' || e === 'show_loader'
          );
          this.chain_accounts = [];
          this.chain_key_refs = [];
          this.chain_address_balances = [];
          this.chain_assets = [];
          this.chain_objects_list = [];
          this.chain_accounts_list = [];
          this.chain_assets_list = [];
          this.required_props = [];
          this.all_chain_props = this.chain_objects;
        } else {
          this.chain_objects = propTypesArray.filter(flow(secondEl, isObjectType)).map(firstEl);
          this.chain_accounts = propTypesArray.filter(flow(secondEl, isAccountType)).map(firstEl);
          this.chain_key_refs = propTypesArray.filter(flow(secondEl, isKeyRefsType)).map(firstEl);
          this.chain_address_balances = propTypesArray
            .filter(flow(secondEl, isAddressBalancesType)).map(firstEl);
          this.chain_assets = propTypesArray.filter(flow(secondEl, isAssetType)).map(firstEl);
          this.chain_objects_list = propTypesArray
            .filter(flow(secondEl, isObjectsListType)).map(firstEl);
          this.chain_accounts_list = propTypesArray
            .filter(flow(secondEl, isAccountsListType)).map(firstEl);
          this.chain_assets_list = propTypesArray
            .filter(flow(secondEl, isAssetsListType)).map(firstEl);
          this.required_props = propTypesArray
            .filter(flow(secondEl, checkIfRequired)).map(firstEl);
          this.all_chain_props = [...this.chain_objects,
            ...this.chain_accounts,
            ...this.chain_key_refs,
            ...this.chain_address_balances,
            ...this.chain_assets,
            ...this.chain_objects_list];
        }

        if (options && options.require_all_props) {
          this.required_props = this.all_chain_props;
        }

        this.dynamic_props = {};
        this.default_props = clone(Component.defaultProps) || {};

        for (const key in this.default_props) {
          const value = this.default_props[key];

          if (typeof(value) === 'string' && value.indexOf('props.') === 0) {
            this.dynamic_props[key] = get(this, value);
          }
        }

        this.tempComponent = Component.defaultProps
          ? Component.defaultProps.tempComponent || null
          : null;

        this.update = this.update.bind(this);
        this.state = {resolved: false};
      }

      shouldComponentUpdate(nextProps, nextState){
        return !utils.are_equal_shallow(this.props, nextProps)
          || !utils.are_equal_shallow(this.state, nextState);
      }

      componentWillMount() {
        ChainStore.subscribe(this.update);
        this.update();
      }

      componentWillUnmount() {
        ChainStore.unsubscribe(this.update);
      }

      componentWillReceiveProps(nextProps) {
        if (options && options.all_props) {
          this.chain_objects = reject(
            Object.keys(nextProps),
            (e) => e === 'children' || e === 'keep_updating' || e === 'show_loader'
          );
          this.all_chain_props = this.chain_objects;
          this.setState = pick(this.state, this.chain_objects);
        }

        let propsObj = null;

        for(const k in this.dynamic_props) {
          const selector = this.default_props[k];

          if (!propsObj) {
            propsObj = {props: nextProps};
          }

          const curValue = get(this, selector);
          const nextValue = get(propsObj, selector);

          if (nextValue && nextValue !== curValue) {
            this.dynamic_props[k] = get(propsObj, selector);
          }
        }

        this.update(nextProps);
      }

      update(nextProps = null) {
        const props = nextProps || this.props;
        const newState = {};
        let allObjectsCounter = 0;
        let resolvedObjectsCounter = 0;

        for(const key of this.chain_objects ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            const newObj = ChainStore.getObject(prop);

            if (
              newObj === undefined
              && this.required_props.indexOf(key) === -1
              && newObj !== this.state[key]
            ) {
              newState[key] = newObj;
            } else if (newObj && newObj !== this.state[key]) {
              newState[key] = newObj;
            }

            ++allObjectsCounter;

            if (newObj !== undefined) {
              ++resolvedObjectsCounter;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_accounts ) {
          let prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            if (prop[0] === '#' && Number.parseInt(prop.substring(1))) {
              prop = '1.2.' + prop.substring(1);
            }

            const newObj = ChainStore.getAccount(prop);

            if (
              newObj === undefined
              && this.required_props.indexOf(key) === -1
              && newObj !== this.state[key]
            ) {
              newState[key] = newObj;
            } else if (newObj && newObj !== this.state[key]) {
              newState[key] = newObj;
            }

            ++allObjectsCounter;

            if (newObj !== undefined) {
              ++resolvedObjectsCounter;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_key_refs ) {
          const prop = props[key] || this.dynamic_prop[key] || this.default_props[key];

          if (prop) {
            const newObj = ChainStore.getAccountRefsOfKey(prop);

            if (
              newObj === undefined
              && this.required_props.indexOf(key) === -1
              && newObj !== this.state[key]
            ) {
              newState[key] = newObj;
            } else if (newObj && newObj !== this.state[key]) {
              newState[key] = newObj;
            }

            ++allObjectsCounter;

            if (newObj !== undefined) {
              ++resolvedObjectsCounter;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_address_balances ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            const newObj = ChainStore.getBalanceObjects(prop);

            if (
              newObj === undefined
              && this.required_props.indexOf(key) === -1
              && newObj !== this.state[key]
            ) {
              newState[key] = newObj;
            } else if (newObj && newObj !== this.state[key]) {
              newState[key] = newObj;
            }

            ++allObjectsCounter;

            if (newObj !== undefined) {
              ++resolvedObjectsCounter;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_assets ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            const newObj = ChainStore.getAsset(prop);

            if (
              newObj === undefined
              && this.required_props.indexOf(key) === -1
              && newObj !== this.state[key]
            ) {
              newState[key] = newObj;
            } else if (newObj && newObj !== this.state[key]) {
              newState[key] = newObj;
            }

            ++allObjectsCounter;

            if (newObj !== undefined) {
              ++resolvedObjectsCounter;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_objects_list ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            let propPrevState = this.state[key];
            const propNewState = [];
            let changes = false;

            if (!propPrevState || propPrevState.length !== prop.size) {
              propPrevState = [];
              changes = true;
            }

            let index = 0;
            prop.forEach( (objId) => {
              ++index;

              if (objId) {
                const newObj = ChainStore.getObject(objId);

                if (newObj) {
                  ++resolvedObjectsCounter;
                }

                if (propPrevState[index] !== newObj) {
                  changes = true;
                  propNewState[index] = newObj;
                } else {
                  propNewState[index] = propPrevState[index];
                }
              }

              ++allObjectsCounter;
            });

            if (changes) {
              newState[key] = propNewState;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_accounts_list ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            let propPrevState = this.state[key];
            const propNewState = [];
            let changes = false;

            if (!propPrevState || propPrevState.length !== prop.size) {
              propPrevState = [];
              changes = true;
            }

            let index = 0;
            prop.forEach( (objId) => {
              if (objId) {
                const newObj = ChainStore.getAccount(objId);

                if (newObj) {
                  ++resolvedObjectsCounter;
                }

                if (propPrevState[index] !== newObj) {
                  changes = true;
                  propNewState[index] = newObj;
                } else {
                  propNewState[index] = propPrevState[index];
                }
              }

              ++index;
              ++allObjectsCounter;
            });

            if (changes) {
              newState[key] = propNewState;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        for (const key of this.chain_assets_list ) {
          const prop = props[key] || this.dynamic_props[key] || this.default_props[key];

          if (prop) {
            let propPrevState = this.state[key];
            const propNewState = [];
            let changes = false;

            if (!propPrevState || propPrevState.length !== prop.size) {
              propPrevState = [];
              changes = true;
            }

            let index = 0;
            prop.forEach( (objId) => {
              ++index;

              if (objId) {
                const newObj = ChainStore.getAsset(objId);

                if (newObj) {
                  ++resolvedObjectsCounter;
                }

                if (propPrevState[index] !== newObj) {
                  changes = true;
                  propNewState[index] = newObj;
                } else {
                  propNewState[index] = propPrevState[index];
                }
              }

              ++allObjectsCounter;
            });

            if (changes) {
              newState[key] = propNewState;
            }
          } else {
            if (this.state[key]) {
              newState[key] = null;
            }
          }
        }

        if (allObjectsCounter <= resolvedObjectsCounter) {
          newState.resolved = true;
        }

        this.setState( newState );
      }

      componentName() {
        const cf = Component.toString();
        return cf.substr(9, cf.indexOf('(') - 9);
      }

      render() {
        const props = omit(this.props, this.all_chain_props);

        for (const prop of this.required_props)  {
          if (!this.state[prop]) {
            if (typeof options !== 'undefined' && options.show_loader) {
              return <LoadingIndicator />;
            } else {
              // returning a temp component of the desired type prevents invariant violation errors,
              // notably when rendering tr components to use, specicy a defaultProps field of
              // tempComponent: "tr" (or "div", "td", etc as desired)
              return this.tempComponent ? React.createElement(this.tempComponent) : null;
            }
          }
        }

        return <Component { ...props } { ...this.state }/>;
      }
    };

  };
}

@BindToChainState({all_props: true, require_all_props: true})
class Wrapper extends React.Component {
  render() {
    return <span className='wrapper'>
      {this.props.children(this.props)}
    </span>;
  }
}

BindToChainState.Wrapper = Wrapper;

export default BindToChainState;
