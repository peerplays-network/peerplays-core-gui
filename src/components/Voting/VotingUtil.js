import React from 'react';
import Translate from 'react-translate-component';

function voteRender(type, obj, voted, unvoted, account) {
  // Can be either `vote` or `unvote`
  let h2Msg = 'votes.cm_approved_by';
  let renderByType = voted;

  if (type.toLowerCase().includes('witness')) {
    h2Msg = 'votes.w_approved_by';
  } else if(type.toLowerCase().includes('son')) {
    h2Msg = 'votes.son_approved_by';
  }

  if (type.toLowerCase().includes('unvote')) {
    renderByType = unvoted;

    if (type.toLowerCase().includes('witness')) {
      h2Msg = 'votes.w_not_approved_by';
    } else if (type.toLowerCase().includes('committee')) {
      h2Msg = 'votes.cm_not_approved_by';
    } else if (type.toLowerCase().includes('son')) {
      h2Msg = 'votes.son_not_approved_by';
    }
  }

  return obj.size
    ? <div className='table__section'>
      <h2 className='h2'>
        <Translate content={ h2Msg } account={ account } />
      </h2>
      <div className='table table2 table-voting-committee'>
        <div className='table__head tableRow'>
          <div className='tableCell'>&nbsp;</div>
          <div className='tableCell'><Translate content='votes.name'/></div>
          <div className='tableCell'><Translate content='votes.url'/></div>
          <div className='tableCell text_r'><Translate content='votes.votes'/></div>
          <div className='tableCell text_r'>
            <div className='table__thAction'><Translate content='votes.action'/></div>
          </div>
        </div>
        <div className='table__body'>
          {renderByType}
        </div>
      </div>
    </div>
    : null;
}

export {
  voteRender
};
