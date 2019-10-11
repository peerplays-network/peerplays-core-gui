import React from 'react';
import Translate from 'react-translate-component';
import Voting from '../../../Voting/VotingContainer';


class Vote extends React.Component {
  render() {
    return(
      <div className='gpos-modal__voting'>
        <div className='gpos-modal__voting--left'>
          <Translate
            component='p'
            className='txt'
            content='gpos.modal.vote'
          />
        </div>
        <div className='gpos-modal__voting--right'>
          <Voting handlers={ {cancel: this.props.cancelHandler, finish: this.props.finishHandler} }/>
        </div>
      </div>
    );
  }
}

export default Vote;