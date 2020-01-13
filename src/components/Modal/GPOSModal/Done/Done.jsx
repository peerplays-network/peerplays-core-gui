import React from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';

class Done extends React.PureComponent {
  doneHandler = () => {
    this.props.okHandler(0);
  }

  render() {
    return(
      <div className='gpos-modal__done'>
        <div className='gpos-modal__done-left'>
          <div className='gpos-modal__done-img-wrapper'>
            <img className='gpos-modal__done-img' src='images/gpos/done.png' alt=''/>
          </div>
        </div>
        <div className='gpos-modal__done-right'>
          <Translate
            component='p'
            className='title'
            content='gpos.complete.title'
          />
          <Translate
            component='p'
            className='txt--spaced'
            content='gpos.complete.text-1'
          />
          <ul className='gpos-modal__done-right list'>
            <Translate
              component='li'
              className='txt--li'
              content='gpos.complete.text-2'
            />
            <Translate
              component='li'
              className='txt--li'
              content='gpos.complete.text-3'
            />
            <Translate
              component='li'
              className='txt--li'
              content='gpos.complete.text-4'
            />
          </ul>
          <div className='gpos-modal__btns-done'>
            <button className='gpos-modal__btn-done' onClick={ this.doneHandler }>
              <Translate className='gpos-modal__btn-txt' content='gpos.modal.ok' />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, null)(Done);
