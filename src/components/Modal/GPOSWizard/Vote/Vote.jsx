import React from 'react';
import {connect} from 'react-redux';
import Voting from '../../../Voting/VotingContainer';


class Vote extends React.Component {
  render() {
    return(
      <div>
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