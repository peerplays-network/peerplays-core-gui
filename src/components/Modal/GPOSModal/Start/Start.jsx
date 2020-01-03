import React from 'react';
import Translate from 'react-translate-component';

class GposModalStart extends React.Component {
  render() {
    const {closeModal, proceedOrRegress, completedStages, totalGpos} = this.props;
    let hasProgress = Object.values(completedStages).indexOf(true) > -1;
    let btnTxt = !hasProgress ? 'gpos.modal.cancel' : 'gpos.modal.done';
    let canDo = false;

    // If the users' GPOS Balance is greater than 0 and they have not already voted, allow.
    if (totalGpos > 0) {
      canDo = true;
    }

    return (
      <div className='gpos-modal__content'>
        <div className='gpos-modal__content-left'>
          <div className='gpos-modal__modal-desc'>
            <Translate
              component='div'
              className='title'
              content='gpos.start.desc.title'
            />
            <Translate
              component='p'
              className='txt--bold'
              content='gpos.start.desc.txt-1'
            />
            <Translate
              component='p'
              className='txt--bold'
              content='gpos.start.desc.txt-2'
            />
            <Translate
              component='p'
              className='txt'
              content='gpos.start.desc.txt-3'
            />
            <Translate
              component='p'
              className='txt'
              content='gpos.start.desc.txt-4'
            />
            <Translate
              component='p'
              className='txt--indent txt--bold'
              content='gpos.start.desc.txt-5'
            />
            <Translate
              component='p'
              className='txt--indent txt--bold'
              content='gpos.start.desc.txt-6'
            />
            <Translate
              component='p'
              className='txt--margin-top line'
              content='gpos.start.desc.txt-7'
            />
          </div>
        </div>
        <div className='gpos-modal__content-right'>
          <div className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.1) }>
            <img className='gpos-modal__card-1' src='images/gpos/power-up.png' alt='stage1'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.start.right.1'
            />
          </div>
          <div disabled={ !canDo } className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.2) }>
            <img className='gpos-modal__card-2' src='images/gpos/power-down.png' alt='stage2'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.start.right.2'
            />
          </div>
          <div disabled={ !canDo } className='gpos-modal__card-btn--no-marg' onClick={ () => proceedOrRegress(2) }>
            <img className='gpos-modal__card-3' src='images/gpos/vote.png' alt='stage3'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.start.right.3'
            />
          </div>
          <div className='gpos-modal__btns'>
            <button className='gpos-modal__btn-cancel' onClick={ closeModal }>
              <Translate className='gpos-modal__btn-txt' content={ btnTxt }/>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GposModalStart;