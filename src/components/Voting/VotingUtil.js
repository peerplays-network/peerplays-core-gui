import React from 'react';
import Translate from 'react-translate-component';

export default function voteRender(type, obj, voted, unvoted, account) {
  // Can be either `vote` or `unvote`
  const renderByType = type === 'vote' ? voted : unvoted;

  return obj.size
    ? <div className='table__section'>
      <h2 className='h2'>
        <Translate content='votes.cm_approved_by' account={ account } />
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