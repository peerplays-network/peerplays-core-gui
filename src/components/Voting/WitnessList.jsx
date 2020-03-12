import React from 'react';
import Translate from 'react-translate-component';
import {connect} from 'react-redux';
import WitnessRow from './WitnessRow';

class WitnessListNew extends React.Component {
  state = {
    initialRowData: [],
    rowData: [],
    ranks: [],
    sortDirections: {
      // true = ascend, false = descend
      rank: 'default',
      name: 'default',
      last_block: 'default',
      last_confirmed: 'default',
      total_missed: 'default',
      votes: 'default'
    }
  };

  componentDidMount() {
    // Get initial data and set to state
    const {activeWitnesseAccounts, activeWitnesseObjects} = this.props;
    let most_recent_aslot = 0;
    let ranks = {};
    let witnesses = activeWitnesseObjects;

    witnesses
      .sort((a, b) => {
        if (a && b) {
          return parseInt(b.total_votes, 10) - parseInt(a.total_votes, 10);
        }

        return null;
      })
      .forEach((w, index) => {
        if (w) {
          let s = w.last_aslot;

          if (most_recent_aslot < s) {
            most_recent_aslot = s;
          }

          ranks[w.id] = index + 1;
        }
      });

    let itemRows = null;

    if (witnesses.size > 0) {
      itemRows = witnesses
        .filter((a) => {
          if (!a) {
            return false;
          }

          let account = activeWitnesseAccounts.get(a.witness_account);

          if (!account) {
            return false;
          }

          let name = account.name;

          if (!name) {
            return false;
          }

          return true;
        })
        .map((a) => {
          let a_account = activeWitnesseAccounts.get(a.witness_account);

          return (
            <WitnessRow key={ a.id } rank={ ranks[a.id] } witnessAccount={ a_account } witness={ a } />
          );
        });

      this.setState({
        initialRowData: itemRows,
        rowData: itemRows,
        ranks
      });
    }
  }

  // Modify the sort direction on the column header
  sortBy = (col) => {
    // Determine column accessor
    let accessor;

    switch (col) {
      case 'rank':
        accessor = 'props.rank';
        break;
      case 'name':
        accessor = 'props.witnessAccount.name';
        break;
      case 'last_block':
        accessor = 'props.witness.last_aslot';
        break;
      case 'last_confirmed':
        accessor = 'props.witness.last_confirmed_block_num';
        break;
      case 'total_missed':
        accessor = 'props.witness.total_missed';
        break;
      case 'votes':
        accessor = 'props.witness.total_votes';
        break;
      default:
        break;
    }

    // Set the column sort indicator for the clicked column header and remove the icon for the rest
    let newSortDir = this.state.sortDirections;

    Object.keys(newSortDir).forEach((k) => {
      if (k !== col) {
        newSortDir[k] = 'default';
      }
    });

    if (this.state.sortDirections[col] === 'default') {
      newSortDir[col] = false;
    } else {
      newSortDir[col] = !this.state.sortDirections[col];
    }

    // Get current sort direction for clicked column header and invert (setState is async so no guarantee it has updated)
    const sortedItemRows = this.state.rowData.sort((a, b) => {
      const aValue = this.getAccessor(a, accessor);
      const bValue = this.getAccessor(b, accessor);

      if (aValue && bValue) {
        if (newSortDir[col]) {
          return aValue > bValue ? 1 : -1;
        } else if (!newSortDir[col]) {
          return aValue < bValue ? 1 : -1;
        }
      }

      return this.state.initialRowData; // return initial data
    });

    this.setState({
      sortDirections: newSortDir, // Invert sort direction
      rowData: sortedItemRows
    });
  };

  getAccessor = (obj, str) => {
    str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    str = str.replace(/^\./, ''); // strip a leading dot
    var a = str.split('.');

    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];

      if (k in obj) {
        obj = obj[k];
      } else {
        return {};
      }
    }

    return obj;
  };

  render() {
    const {rowData, sortDirections} = this.state;

    return (
      <div>
        <div className='table table2 table-voting-witnesses2'>
          <div className='table__head tableRow'>
            <div
              className={ `tableCell sort--${sortDirections.rank}` }
              onClick={ () => this.sortBy('rank') }
            >
              <Translate content='witnesses.rank' />
            </div>
            <div
              className={ `tableCell sort--${sortDirections.name}` }
              onClick={ () => this.sortBy('name') }
            >
              <Translate content='votes.name' />
            </div>
            <div
              className={ `tableCell text_r sort--${sortDirections.last_block}` }
              onClick={ () => this.sortBy('last_block') }
            >
              <Translate content='witnesses.last_block' />
            </div>
            <div
              className={ `tableCell text_r sort--${sortDirections.last_confirmed}` }
              onClick={ () => this.sortBy('last_confirmed') }
            >
              <Translate content='witnesses.last_confirmed' />
            </div>
            <div
              className={ `tableCell text_r sort--${sortDirections.total_missed}` }
              onClick={ () => this.sortBy('total_missed') }
            >
              <Translate content='witnesses.missed' />
            </div>
            <div
              className={ `tableCell text_r sort--${sortDirections.votes}` }
              onClick={ () => this.sortBy('votes') }
            >
              <Translate content='votes.votes' />
            </div>
          </div>
          <div className='table__body'>{rowData}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current: state.voting.witnesses.currentWitnessId,
    activeWitnesseObjects: state.voting.witnesses.activeWitnesseObjects,
    activeWitnesseAccounts: state.voting.witnesses.activeWitnesseAccounts
  };
};

export default connect(mapStateToProps)(WitnessListNew);
