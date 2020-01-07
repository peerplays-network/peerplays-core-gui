import React from 'react';
import Translate from 'react-translate-component';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {connect} from 'react-redux';
import {VotingActions} from '../../actions';
import Proxy from './Proxy';
import Witnesses from './Witnesses';
import CommitteeMembers from './CommitteeMembers';
import SLoader from '../Loaders/SLoader';
import {bindActionCreators} from 'redux';

class VotingContainer extends React.Component {
  state = {
    loaded: false,
    selectedTab: 0
  }

  componentWillMount() {
    this.props.fetchData().then(() => {
      this.setState({loaded: true});
    });
  }

  onChangeActiveMenuItem(e) {
    let {selectedTab} = this.state;

    switch (e) {
      case 0:
        selectedTab = 'proxy';
        break;
      case 1:
        selectedTab = 'witness';
        break;
      case 2:
        selectedTab = 'committee';
        break;
      default:
        selectedTab = 'proxy';
    }

    this.setState({selectedTab: e});
    return selectedTab;
  }

  voteHandler = () => {
    this.props.updateHasVoted();
  }

  renderHandlerButtons = (overRide = false) => {
    let {handlers} = this.props;
    const canFinish = overRide ? !overRide : !this.props.hasVoted;

    return(
      <div className='gpos-modal__btns-vote'>
        <button className='gpos-modal__btn-cancel' onClick={ () => handlers.cancel(0) }>
          <Translate className='gpos-modal__btn-txt' content='gpos.modal.cancel' />
        </button>
        <button disabled={ canFinish } className='gpos-modal__btn-submit' onClick={ () => handlers.finish(3, 2) }>
          <Translate className='gpos-modal__btn-txt' content='gpos.modal.finish' />
        </button>
      </div>
    );
  }

  render() {
    let selectedIndex = this.state.selectedTab;
    let content = () => <Tabs
      className='pt40'
      onSelect={ this.onChangeActiveMenuItem.bind(this) }
      selectedIndex={ selectedIndex }>
      <TabList>
        <Tab selected={ selectedIndex === 0 }><Translate content='votes.proxy_short'/></Tab>
        <Tab selected={ selectedIndex === 1 }><Translate content='votes.add_witness_label'/></Tab>
        <Tab selected={ selectedIndex === 2 }><Translate content='votes.advisors'/></Tab>
      </TabList>

      <TabPanel><Proxy renderHandlers={ this.renderHandlerButtons } handleVote={ this.voteHandler }/></TabPanel>
      <TabPanel><Witnesses renderHandlers={ this.renderHandlerButtons } handleVote={ this.voteHandler }/></TabPanel>
      <TabPanel><CommitteeMembers renderHandlers={ this.renderHandlerButtons } handleVote={ this.voteHandler }/></TabPanel>
    </Tabs>;

    if (!this.state.loaded) {
      content = () => <SLoader/>;
    }

    return (
      <div className='main'>
        <section className='content'>
          <div className='box'>
            {content()}
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    hasVoted: state.voting.hasVoted
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchData : VotingActions.fetchData,
    updateHasVoted: VotingActions.toggleHasVoted
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(VotingContainer);
