import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Translate from 'react-translate-component';
import {HelpActions} from '../../actions';
// import {translate} from 'counterpart';

class GPOSPanel extends Component {
  onClickHelpLearn = (e) => {
    this.props.toggleHelpModal(true);
    e.preventDefault();
  }

  render() {
    return (
      <div className='gpos-panel'>
        <Translate
          component='div'
          className='aside__title gpos-panel__title'
          content='gpos.side.title'
        />
        <div className='gpos-panel__desc'>
          <Translate
            component='p'
            className='gpos-panel__desc-txt'
            content='gpos.side.desc'
          />
          <Translate
            component='a'
            className='gpos-panel__desc-link'
            content='gpos.side.learn'
            onClick={ this.onClickHelpLearn }
          />
        </div>
        <button
          type='button'
          className='btn btn-content__head'
          // onClick={ }
        >
          <Translate content='gpos.side.start'/>
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => { // eslint-disable-line
  return {

  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    toggleHelpModal: HelpActions.toggleHelpModal
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(GPOSPanel);