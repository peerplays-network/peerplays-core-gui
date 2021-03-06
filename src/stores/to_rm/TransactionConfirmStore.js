import alt from '../../alt-instance';
import TransactionConfirmActions from '../../actions/TransactionConfirmActions';

class TransactionConfirmStore {
  constructor() {
    this.bindActions(TransactionConfirmActions);
    this.state = this.getInitialState();
    this.exportPublicMethods({reset: this.reset.bind(this)});
  }

  getInitialState() {
    return {
      transaction: null,
      error: null,
      broadcasting: false,
      broadcast: false,
      included: false,
      trx_id: null,
      trx_block_num: null,
      closed: true,
      broadcasted_transaction: null,
      propose: false,
      fee_paying_account: null // proposal fee_paying_account
    };
  }

  onConfirm({transaction}) {
    let init_state = this.getInitialState();
    let state = {
      ...init_state,
      transaction: transaction,
      closed: false,
      broadcasted_transaction: null
    };
    this.setState(state);
  }

  onClose() {
    this.setState({closed: true});
  }

  onBroadcast() {
    this.setState({broadcasting: true});
  }

  onWasBroadcast() {
    this.setState({broadcasting: false, broadcast: true});
  }

  onWasIncluded(res) {
    this.setState({
      error: null,
      broadcasting: false,
      broadcast: true,
      included: true,
      trx_id: res[0].id,
      trx_block_num: res[0].block_num,
      broadcasted_transaction: this.state.transaction});
  }

  onError({error}) {
    this.setState({broadcast: false, broadcasting: false, error});
  }

  onTogglePropose() {
    this.setState({propose: ! this.state.propose});
  }

  onProposeFeePayingAccount(fee_paying_account) {
    this.setState({fee_paying_account});
  }

  reset() {
    this.state = this.getInitialState();
  }
}

export default alt.createStore(TransactionConfirmStore, 'TransactionConfirmStore');
