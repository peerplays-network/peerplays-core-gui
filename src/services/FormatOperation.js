import counterpart from 'counterpart';
import {ChainStore,ChainTypes} from 'peerplaysjs-lib';
import market_utils from '../common/market_utils';
import asset_utils from '../common/asset_utils';
import utils from '../common/utils';

let {operations} = ChainTypes;
let ops = Object.keys(operations);

function convertAmount({
  amount,
  asset_id
}) {
  let asset = ChainStore.getAsset(asset_id);

  if (!asset) {
    return null;
  }

  let number = amount / Math.pow(10, asset.get('precision'));
  return asset ? {
    amount: utils.round_number(number, asset),
    asset: asset.toJS()
  } : null;
}

/**
 * Dashboard, Recent Activity:  format the operations
 * @param obj
 * @returns {*}
 */
export function formatOperation(obj) {
  let sender, receiver, amount, price, base, quote;
  let op = obj.op;

  switch (op[0]) {
    case 0:
      sender = ChainStore.getAccount(op[1].from);
      receiver = ChainStore.getAccount(op[1].to);
      let amountValue = op[1].amount.amount;
      let asset = ChainStore.getAsset(op[1].amount.asset_id);
      let memo = op[1].memo ? op[1].memo : null;

      amount = asset
        ? `${amountValue / Math.pow(10, asset.get('precision'))} 
          ${asset_utils.getSymbol(asset.get('symbol'))}`
        : null;
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.transfer'),
        sender: sender ? sender.get('name') : '',
        receiver: receiver ? receiver.get('name') : '',
        description: sender && receiver ?
          counterpart.translate('activity.transfer', {
            from: sender.get('name'),
            to: receiver.get('name'),
            amount
          }) : '',
        memo
      };

    case 1:
      let isAsk = market_utils.isAskOp(op[1]);
      base = isAsk ? convertAmount(op[1].min_to_receive) : convertAmount(op[1].amount_to_sell);
      quote = isAsk ? convertAmount(op[1].amount_to_sell) : convertAmount(op[1].min_to_receive);
      let number = base && quote
        ? Math.round(quote.amount / base.amount
          * Math.pow(10, quote.asset.precision)) / Math.pow(10, quote.asset.precision) : null;
      price = base && quote
        ? `${number} ${asset_utils.getSymbol(quote.asset.symbol)}
          /${asset_utils.getSymbol(base.asset.symbol)}`
        : null;
      // let total = quote ? `${quote.amount} ${asset_utils.getSymbol(quote.asset.symbol)}` : null;
      amount = base ? `${base.amount} ${asset_utils.getSymbol(base.asset.symbol)}` : null;
      sender = ChainStore.getAccount(op[1].seller);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.limit_order_create'),
        sender: sender ? sender.get('name') : null,
        receiver: null,
        description: counterpart.translate(
          isAsk ? 'activity.limit_order_buy' : 'activity.limit_order_sell', {
            account: sender ? sender.get('name') : null,
            amount,
            price
          }
        )
      };

    case 2:
      sender = ChainStore.getAccount(op[1].fee_paying_account);
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.limit_order_cancel'),
        sender: sender ? sender.get('name') : null,
        receiver: null,
        description: counterpart.translate('activity.limit_order_cancel', {
          account: sender ? sender.get('name') : null,
          order: op[1].order.substring(4)
        })
      };
    case 3:
      sender = ChainStore.getAccount(op[1].funding_account);
      let debt = convertAmount(op[1].delta_debt);
      let collateral = convertAmount(op[1].delta_collateral);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.call_order_update'),
        sender: sender ? sender.get('name') : null,
        receiver: null,
        description: counterpart.translate(
          'activity.call_order_update', {
            account: sender ? sender.get('name') : null,
            debtSymbol: debt ? debt.asset.symbol : null,
            debt: debt ? debt.amount : null,
            collateral: collateral ? collateral.amount : null
          }
        )
      };
    case 4:
      sender = ChainStore.getAccount(op[1].account_id);
      amount = convertAmount({
        amount: op[1].fee.asset_id === op[1].receives.asset_id
          ? op[1].receives.amount - op[1].fee.amount
          : op[1].receives.amount,
        asset_id: op[1].receives.asset_id
      });
      base = convertAmount(op[1].pays);
      quote = convertAmount(op[1].receives);
      price = base && quote
        ? Math.round(quote.amount / base.amount * Math.pow(10, quote.asset.precision))
          / Math.pow(10, quote.asset.precision)
        : null;
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.fill_order'),
        sender: sender ? sender.get('name') : null,
        receiver: null,
        description: counterpart.translate(
          'activity.fill_order', {
            account: sender ? sender.get('name') : null,
            received: amount
              ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}`
              : null,
            price: base && quote
              ? `${price} ${asset_utils.getSymbol(quote.asset.symbol)}
                /${asset_utils.getSymbol(base.asset.symbol)}`
              : null
          }
        )
      };
    case 5:
      sender = ChainStore.getAccount(op[1].registrar);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_create'),
        sender: sender ? sender.get('name') : '',
        receiver: op[1].name,
        description: sender ?
          counterpart.translate('activity.reg_account', {
            registrar: sender.get('name'),
            new_account: op[1].name
          }) : ''

      };
    case 6:
      sender = ChainStore.getAccount(op[1].account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_update'),
        sender: sender ? sender.get('name') : '',
        receiver: null,
        description: sender ?
          counterpart.translate('activity.update_account', {
            account: sender.get('name')
          }) : ''
      };
    case 7:
      sender = ChainStore.getAccount(op[1].authorizing_account);
      receiver = ChainStore.getAccount(op[1].account_to_list);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_whitelist'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.whitelisted_by', {
          lister: sender ? sender.get('name') : '',
          listee: receiver ? receiver.get('name') : ''
        })
      };
    case 8:
      sender = ChainStore.getAccount(op[1].account_to_upgrade);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_upgrade'),
        sender: sender ? sender.get('name') : '',
        receiver: sender ? sender.get('name') : '',
        description: op[1] && op[1]['upgrade_to_lifetime_member']
          ? counterpart.translate('account.member.lifetime')
          : null
      };
    case 9:
      sender = ChainStore.getAccount(op[1].account_id);
      receiver = ChainStore.getAccount(op[1].new_owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_transfer'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.transfer_account', {
          account: sender ? sender.get('name') : '',
          to: receiver ? receiver.get('name') : ''
        })
      };
    case 10:
      sender = ChainStore.getAccount(op[1].issuer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.asset_create', {
          account: sender ? sender.get('name') : '',
          asset: op[1].symbol
        })
      };
    case 11:
      sender = ChainStore.getAccount(op[1].issuer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.asset_update', {
          account: sender ? sender.get('name') : '',
          asset: op[1].asset_to_update.symbol
        })
      };
    case 12:
      sender = ChainStore.getAccount(op[1].issuer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_update_bitasset'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.asset_update', {
          account: sender ? sender.get('name') : '',
          asset: op[1].asset_to_update.symbol
        })
      };
    case 13:
      sender = ChainStore.getAccount(op[1].issuer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_update_feed_producers'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.asset_update_feed_producers', {
          account: sender ? sender.get('name') : '',
          asset: op[1].asset_to_update.symbol
        })
      };
    case 14:
      sender = ChainStore.getAccount(op[1].issuer);
      receiver = ChainStore.getAccount(op[1].issue_to_account);
      amount = convertAmount(op[1].asset_to_issue);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_issue'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: sender && receiver && amount ? counterpart.translate('activity.asset_issue', {
          account: sender.get('name'),
          amount: `${amount.amount} ${amount.asset.symbol}`,
          to: receiver.get('name')
        }) : ''
      };
    case 15:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 16:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 17:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 18:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 19:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 20:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 21:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 22:
      sender = ChainStore.getAccount(op[1].fee_paying_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.proposal_create'),
        sender: sender ? sender.get('name') : null,
        receiver: null,
        description: sender ? counterpart.translate('activity.proposal_create', {
          account: sender.get('name')
        }) : ''
      };
    case 23:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 24:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 25:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 26:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 27:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 28:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 29:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 30:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 31:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 32:
      sender = ChainStore.getAccount(op[1].owner);
      amount = convertAmount(op[1].amount);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.vesting_balance_create'),
        sender: sender ? sender.get('name') : null,
        receiver: sender ? sender.get('name') : null,
        description: sender && amount ? counterpart.translate('activity.vesting_balance_deposit', {
          account: sender.get('name'),
          amount: `${amount.amount} ${amount.asset.symbol}`,
          balance_type: op[1].balance_type
        }) : ''
      };
    case 33:
      sender = ChainStore.getAccount(op[1].owner);
      amount = convertAmount(op[1].amount);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.vesting_balance_withdraw'),
        sender: sender ? sender.get('name') : null,
        receiver: sender ? sender.get('name') : null,
        description: sender && amount ? counterpart.translate('activity.vesting_balance_withdraw', {
          account: sender.get('name'),
          amount: `${amount.amount} ${amount.asset.symbol}`
        }) : ''
      };
    case 34:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 35:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 36:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 37:

      amount = convertAmount(op[1].total_claimed);
      sender = ChainStore.getAccount(op[1].deposit_to_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.balance_claim'),
        sender: '—',
        receiver: sender ? sender.get('name') : '—',
        description: amount && sender ? counterpart.translate('activity.balance_claim', {
          account: sender.get('name'),
          amount: `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}`
        }) : ''
      };
    case 38:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 39:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 40:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 41:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 42:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 43:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 44:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 45:
      sender = ChainStore.getAccount(op[1].creator);

      amount = convertAmount(op[1].options.buy_in);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.tournament_create'),
        sender: sender ? sender.get('name') : null,
        receiver: '—',
        description: sender ? counterpart.translate('activity.tournament_create', {
          account: sender ? sender.get('name') : '',
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        }) : ''
      };
    case 46:
      sender = ChainStore.getAccount(op[1].player_account_id);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.tournament_join'),
        sender: sender ? sender.get('name') : null,
        receiver: '—',
        description: sender ? counterpart.translate('activity.tournament_join', {
          account: sender ? sender.get('name') : '',
          tournament_id: op[1].tournament_id
        }) : ''
      };
    case 47:
      sender = ChainStore.getAccount(op[1].player_account_id);
      let description;

      if (op[1] && op[1]['move'] && op[1]['move'][1]['gesture']) {
        description = sender ? counterpart.translate('activity.game_move_commit', {
          gesture: op[1]['move'][1]['gesture'],
          account: sender ? sender.get('name') : '',
          game_id: op[1].game_id
        }) : '';
      } else {
        description = sender ? counterpart.translate('activity.game_move', {
          account: sender ? sender.get('name') : '',
          game_id: op[1].game_id
        }) : '';
      }

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.game_move'),
        sender: sender ? sender.get('name') : null,
        receiver: '—',
        description: description
      };
    case 48:
      return {
        operation: ops[op[0]],
        type: null,
        sender: null,
        receiver: null,
        description: null
      };
    case 49:
      sender = ChainStore.getAccount(op[1].account_id);
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.asset_dividend_distribution'),
        sender: '—',
        receiver: sender ? sender.get('name') : null,
        description: sender ? counterpart.translate('activity.asset_dividend_distribution', {
          account: sender ? sender.get('name') : ''
        }) : ''
      };
    case 50:
      // payout_amount
      receiver = ChainStore.getAccount(op[1].payout_account_id);
      amount = convertAmount(op[1].payout_amount);

      return {
        operation: 'tournament_payout_operation',
        type: counterpart.translate('transaction.trxTypes.tournament_payout_operation'),
        sender: '—',
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.tournament_payout_operation', {
          tournament_id: op[1].tournament_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 51:
      sender = ChainStore.getAccount(op[1].canceling_account_id);
      receiver = ChainStore.getAccount(op[1].player_account_id);
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.tournament_leave'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.tournament_leave', {
          tournament_id: op[1].tournament_id,
          account: receiver ? receiver.get('name') : ''
        })
      };
    case 52:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sport_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sport_create', {
          name: op[1].name
        })
      };
    case 53:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sport_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sport_update', {
          sport_id: op[1].sport_id,
          name: op[1].new_name
        })
      };
    case 54:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.event_group_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.event_group_create', {
          name: op[1].name
        })
      };
    case 55:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.event_group_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.event_group_update', {
          group_id: op[1].event_group_id,
          sport_id: op[1].new_sport_id,
          name: op[1].new_name
        })
      };
    case 56:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.event_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.event_create', {
          name: op[1].name,
          season: op[1].season
        })
      };
    case 57:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.event_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.event_update', {
          event_id: op[1].event_id,
          name: op[1].new_name,
          season: op[1].new_season
        })
      };
    case 58:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_rules_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_rules_create', {
          name: op[1].name
        })
      };
    case 59:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_rules_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_rules_update', {
          name: op[1].new_name
        })
      };
    case 60:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_group_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_group_create', {
          description: op[1].description
        })
      };
    case 61:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_create', {
          description: op[1].description
        })
      };
    case 62:
      sender = ChainStore.getAccount(op[1].bettor_id);
      amount = convertAmount(op[1].amount_to_bet);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bet_place'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.bet_place', {
          back_or_lay: op[1].back_or_lay,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 63:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_group_resolve'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_group_resolve', {
          group_id: op[1].betting_market_group_id
        })
      };
    case 64:
      receiver = ChainStore.getAccount(op[1].bettor_id);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_group_resolved'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.betting_market_group_resolved', {
          group_id: op[1].betting_market_group_id,
          winnings: op[1].winnings
        })
      };
    case 65:
      receiver = ChainStore.getAccount(op[1].bettor_id);
      amount = convertAmount(op[1].stake_returned);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bet_adjusted'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.bet_adjusted', {
          bet_id: op[1].bet_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 66:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_group_cancel'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_group_cancel', {
          group_id: op[1].betting_market_group_id
        })
      };
    case 67:
      receiver = ChainStore.getAccount(op[1].bettor_id);
      amount = convertAmount(op[1].amount_bet);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bet_matched'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.bet_matched', {
          account: receiver ? receiver.get('name') : '',
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 68:
      receiver = ChainStore.getAccount(op[1].bettor_id);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bet_cancel'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.bet_cancel', {
          account: receiver ? receiver.get('name') : '',
          bet_to_cancel: op[1].bet_to_cancel
        })
      };
    case 69:
      receiver = ChainStore.getAccount(op[1].bettor_id);
      amount = convertAmount(op[1].stake_returned);
      const fees_returned = convertAmount(op[1].unused_fees_returned);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bet_canceled'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.bet_canceled', {
          account: receiver ? receiver.get('name') : '',
          bet_id: op[1].bet_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : '',
          fees: fees_returned ? `${fees_returned.amount} ${asset_utils.getSymbol(fees_returned.asset.symbol)}` : ''
        })
      };
    case 70:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_group_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_group_update', {
          description: op[1].new_description
        })
      };
    case 71:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.betting_market_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.betting_market_update', {
          description: op[1].new_description
        })
      };
    case 77:
      amount = convertAmount(op[1].extensions.ticket_price);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.lottery_asset_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.lottery_asset_create', {
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 78:
      amount = convertAmount(op[1].amount);
      sender = ChainStore.getAccount(op[1].buyer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.ticket_purchase'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.ticket_purchase', {
          tickets_to_buy: op[1].tickets_to_buy,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 79:
      amount = convertAmount(op[1].amount);
      receiver = ChainStore.getAccount(op[1].winner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.lottery_reward'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: op[1].is_benefactor_reward ? counterpart.translate('activity.lottery_reward', {
          lottery_id: op[1].lottery,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        }) : counterpart.translate('activity.lottery_winner', {
          lottery_id: op[1].lottery,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 80:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.lottery_end'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.lottery_end', {
          lottery: op[1].lottery
        })
      };
    case 81:
      receiver = ChainStore.getAccount(op[1].account);
      amount = convertAmount(op[1].amount_to_claim);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sweeps_vesting_claim'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.sweeps_vesting_claim', {
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 82:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_permission_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.custom_permission_create', {
          account: sender ? sender.get('name') : '',
          permission_name: op[1].permission_name
        })
      };
    case 83:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_permission_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.custom_permission_update', {
          account: sender ? sender.get('name') : '',
          permission_id: op[1].permission_id
        })
      };
    case 84:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_permission_delete'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.custom_permission_delete', {
          account: sender ? sender.get('name') : '',
          permission_id: op[1].permission_id
        })
      };
    case 85:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_account_authority_create'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.custom_account_authority_create', {
          permission_id: op[1].permission_id,
          operation: ops[op[1].operation_type]
        })
      };
    case 86:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_account_authority_update'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.custom_account_authority_update', {
          auth_id: op[1].auth_id
        })
      };
    case 87:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.custom_account_authority_delete'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.custom_account_authority_delete', {
          auth_id: op[1].auth_id
        })
      };
    case 88:
      sender = ChainStore.getAccount(op[1].issuer);
      const NFTs = op[1].item_ids.join();

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.offer'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: op[1].buying_item ? counterpart.translate('activity.buy_offer', {
          NFTs: NFTs
        }) : counterpart.translate('activity.sell_offer', {
          NFTs: NFTs
        })
      };
    case 89:
      sender = ChainStore.getAccount(op[1].bidder);
      amount = convertAmount(op[1].bid_price);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.bid'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.bid', {
          offer_id: op[1].offer_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 90:
      sender = ChainStore.getAccount(op[1].issuer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.cancel_offer'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.cancel_offer', {
          offer_id: op[1].offer_id
        })
      };
    case 91:
      sender = ChainStore.getAccount(op[1].fee_paying_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.finalize_offer'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.finalize_offer', {
          offer_id: op[1].offer_id,
          result: op[1].result
        })
      };
    case 92:
      sender = ChainStore.getAccount(op[1].owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_metadata_create'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: op[1].lottery_options ? counterpart.translate('activity.nft_lottery_created', {
          name: op[1].name
        }) : counterpart.translate('activity.nft_metadata_create', {
          name: op[1].name
        })
      };
    case 93:
      sender = ChainStore.getAccount(op[1].owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_metadata_update'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.nft_metadata_update', {
          nft_metadata_id: op[1].nft_metadata_id
        })
      };
    case 94:
      sender = ChainStore.getAccount(op[1].payer);
      receiver = ChainStore.getAccount(op[1].owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_mint'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.nft_mint', {
          nft_metadata_id: op[1].nft_metadata_id
        })
      };
    case 95:
      sender = ChainStore.getAccount(op[1].from);
      receiver = ChainStore.getAccount(op[1].to);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_safe_transfer_from'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.nft_safe_transfer_from', {
          token_id: op[1].token_id
        })
      };
    case 96:
      sender = ChainStore.getAccount(op[1].operator_);
      receiver = ChainStore.getAccount(op[1].approved);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_approve'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.nft_approve', {
          token_id: op[1].token_id,
          account: receiver ? receiver.get('name') : ''
        })
      };
    case 97:
      sender = ChainStore.getAccount(op[1].owner);
      receiver = ChainStore.getAccount(op[1].operator_);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_set_approval_for_all'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: op[1].approved ? counterpart.translate('activity.nft_set_approval_for_all', {
          account: receiver ? receiver.get('name') : ''
        }) : counterpart.translate('activity.nft_set_disapproval_for_all', {
          account: receiver ? receiver.get('name') : ''
        })
      };
    case 98:
      sender = ChainStore.getAccount(op[1].owner);
      const allowed_ops = [];

      for(let i = 0; i < op[1].allowed_operations.length; i++) {
        allowed_ops.push(ops[op[1].allowed_operations[i]]);
      }

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_role_create'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.account_role_create', {
          name: op[1].name,
          allowed_ops: allowed_ops.join()
        })
      };
    case 99:
      sender = ChainStore.getAccount(op[1].owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_role_update'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.account_role_update', {
          account_role_id: op[1].account_role_id
        })
      };
    case 100:
      sender = ChainStore.getAccount(op[1].owner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.account_role_delete'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.account_role_delete', {
          account_role_id: op[1].account_role_id
        })
      };
    case 101:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_create', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 102:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_update', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 103:
      sender = ChainStore.getAccount(op[1].payer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_deregister'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_deregister', {
          son_id: op[1].son_id,
          account: sender ? sender.get('name') : ''
        })
      };
    case 104:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_heartbeat'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_heartbeat', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 105:
      sender = ChainStore.getAccount(op[1].payer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_report_down'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_report_down', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 106:
      sender = ChainStore.getAccount(op[1].owner_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_maintenance'),
        sender: '-',
        receiver: '-',
        description: op[1].request_type == 'request_maintenance' ? counterpart.translate('activity.son_maintenance_requested', {
          account: sender ? sender.get('name') : ''
        }) : counterpart.translate('activity.son_maintenance_request_canceled', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 107:
      sender = ChainStore.getAccount(op[1].payer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_recreate'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_wallet_recreate', {
          account: sender ? sender.get('name') : ''
        })
      };
    case 108:
      sender = ChainStore.getAccount(op[1].payer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_wallet_update', {
          son_wallet_id: op[1].son_wallet_id,
          account: sender ? sender.get('name') : ''
        })
      };
    case 109:
      sender = ChainStore.getAccount(op[1].peerplays_from);
      receiver = ChainStore.getAccount(op[1].peerplays_to);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_deposit_create'),
        sender: sender ? sender.get('name') : null,
        receiver: receiver ? receiver.get('name') : null,
        description: counterpart.translate('activity.son_wallet_deposit_create', {
          sidechain_amount: op[1].sidechain_amount,
          sidechain_currency: op[1].sidechain_currency
        })
      };
    case 110:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_deposit_process'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_wallet_deposit_process', {
          son_wallet_deposit_id: op[1].son_wallet_deposit_id
        })
      };
    case 111:
      sender = ChainStore.getAccount(op[1].peerplays_from);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_withdraw_create'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.son_wallet_withdraw_create', {
          withdraw_sidechain: op[1].withdraw_sidechain,
          withdraw_currency: op[1].withdraw_currency,
          withdraw_amount: op[1].withdraw_amount
        })
      };
    case 112:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.son_wallet_withdraw_process'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.son_wallet_withdraw_process', {
          son_wallet_withdraw_id: op[1].son_wallet_withdraw_id
        })
      };
    case 113:
      sender = ChainStore.getAccount(op[1].sidechain_address_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_address_add'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_address_add', {
          sidechain: op[1].sidechain,
          account: sender ? sender.get('name'): ''
        })
      };
    case 114:
      sender = ChainStore.getAccount(op[1].sidechain_address_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_address_update'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_address_update', {
          sidechain: op[1].sidechain,
          account: sender ? sender.get('name'): ''
        })
      };
    case 115:
      sender = ChainStore.getAccount(op[1].sidechain_address_account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_address_delete'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_address_delete', {
          sidechain: op[1].sidechain,
          account: sender ? sender.get('name'): ''
        })
      };
    case 116:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_transaction_create'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_transaction_create', {
          sidechain: op[1].sidechain,
          transaction: op[1].transaction
        })
      };
    case 117:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_transaction_sign'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_transaction_sign', {
          signer: op[1].signer,
          sidechain_transaction_id: op[1].sidechain_transaction_id
        })
      };
    case 118:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_transaction_send'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_transaction_send', {
          sidechain_transaction_id: op[1].sidechain_transaction_id
        })
      };
    case 119:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.sidechain_transaction_settle'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.sidechain_transaction_settle', {
          sidechain_transaction_id: op[1].sidechain_transaction_id
        })
      };
    case 120:
      amount = convertAmount(op[1].amount);
      sender = ChainStore.getAccount(op[1].buyer);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_lottery_token_purchase'),
        sender: sender ? sender.get('name') : null,
        receiver: '-',
        description: counterpart.translate('activity.nft_lottery_token_purchase', {
          tickets_to_buy: op[1].tickets_to_buy,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 121:
      amount = convertAmount(op[1].amount);
      receiver = ChainStore.getAccount(op[1].winner);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_lottery_reward'),
        sender: '-',
        receiver: receiver ? receiver.get('name') : null,
        description: op[1].is_benefactor_reward ? counterpart.translate('activity.lottery_reward', {
          lottery_id: op[1].lottery_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        }) : counterpart.translate('activity.lottery_winner', {
          lottery_id: op[1].lottery_id,
          amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''
        })
      };
    case 122:
      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.nft_lottery_end'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.lottery_end', {
          lottery: op[1].lottery_id
        })
      };
    case 123:
      sender = ChainStore.getAccount(op[1].account);

      return {
        operation: ops[op[0]],
        type: counterpart.translate('transaction.trxTypes.random_number_store'),
        sender: '-',
        receiver: '-',
        description: counterpart.translate('activity.random_number_store', {
          account: sender ? sender.get('name') : '',
          random_numbers: op[1].random_number.join()
        })
      };
    default:
      return {
        operation: op[0],
        type: op[0],
        sender: null,
        receiver: null,
        description: null
      };
  }
}