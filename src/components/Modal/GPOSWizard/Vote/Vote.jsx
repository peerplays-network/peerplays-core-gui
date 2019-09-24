import React from 'react';
import {connect} from 'react-redux';
import Voting from '../../../Voting/VotingContainer';


class Vote extends React.Component {
  render() {
    return(
      <div className='gpos-modal__voting'>
        <Voting/>
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