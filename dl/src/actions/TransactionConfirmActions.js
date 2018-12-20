//TODO::rm file
import alt from 'alt-instance';
import {ChainConfig} from 'peerplaysjs-ws';

class TransactionConfirmActions {
  confirm(transaction) {
    this.dispatch({transaction});
  }

  broadcast(transaction) {
    this.dispatch();

    let broadcast_timeout = setTimeout(() => {
      this.actions.error(
        'Your transaction has expired without being confirmed, please try again later.'
      );
    }, ChainConfig.expire_in_secs * 2000);

    transaction.broadcast(() => this.actions.wasBroadcast()).then( (res)=> {
      clearTimeout(broadcast_timeout);
      this.actions.wasIncluded(res);
    }).catch( (error) => {
      console.error(error);
      clearTimeout(broadcast_timeout);
      // messages of length 1 are local exceptions (use the 1st line)
      // longer messages are remote API exceptions (use the 2nd line)
      let splitError = error.message.split( '\n' );
      let message = splitError[splitError.length === 1 ? 0 : 1];
      this.actions.error(message);
    });
  }

  wasBroadcast(res){
    this.dispatch(res);
  }

  wasIncluded(res){
    this.dispatch(res);
  }

  close() {
    this.dispatch();
  }

  error(msg) {
    this.dispatch({error: msg});
  }

  togglePropose() {
    this.dispatch();
  }

  proposeFeePayingAccount(fee_paying_account) {
    this.dispatch(fee_paying_account);
  }

}

export default alt.createActions(TransactionConfirmActions);
