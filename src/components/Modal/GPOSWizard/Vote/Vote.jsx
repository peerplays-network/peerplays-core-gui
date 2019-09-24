import React from 'react';
import {connect} from 'react-redux';
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
            content='gpos.wizard.vote'
          />
        </div>
        <div className='gpos-modal__voting--right'>
          <Voting/>
        </div>
      </div>
    );
  }

}

/* eslint-disable-next-line */
const mapStateToProps = (state) => {
  return {

  };
};

export default connect(mapStateToProps, null)(Vote);