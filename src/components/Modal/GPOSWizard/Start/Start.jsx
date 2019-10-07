import React from 'react';
import Translate from 'react-translate-component';

class GposWizardStart extends React.Component {
  renderCompleted = () => {
    return(
      <Translate
        component='span'
        className='gpos-modal__card-txt completed'
        content='gpos.wizard.completed'
      />
    );
  }

  render() {
    let {closeModal, proceedOrRegress, completedStages, totalGpos} = this.props, hasProgress, btnTxt, canVote;
    hasProgress = Object.values(completedStages).indexOf(true) > -1;
    btnTxt = !hasProgress ? 'gpos.wizard.cancel' : 'gpos.wizard.done';

    // Progress must have been made and the user must have a gpos balance
    if (hasProgress && totalGpos > 0) {
      canVote = true;

      // If vote has been completed already, disable...
      if (completedStages['2'] === true) {
        canVote = false;
      }
    } else {
      canVote = false;
    }

    return (
      <div className='gpos-modal__content'>
        <div className='gpos-modal__content-left'>
          <div className='gpos-modal__wizard-desc'>
            <Translate
              component='div'
              className='title'
              content='gpos.wizard.start.desc.title'
            />
            <Translate
              component='p'
              className='txt--bold'
              content='gpos.wizard.start.desc.txt-1'
            />
            <Translate
              component='p'
              className='txt--bold'
              content='gpos.wizard.start.desc.txt-2'
            />
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.start.desc.txt-3'
            />
            <Translate
              component='p'
              className='txt'
              content='gpos.wizard.start.desc.txt-4'
            />
            <Translate
              component='p'
              className='txt--indent txt--bold'
              content='gpos.wizard.start.desc.txt-5'
            />
            <Translate
              component='p'
              className='txt--indent txt--bold'
              content='gpos.wizard.start.desc.txt-6'
            />
            <Translate
              component='p'
              className='txt--margin-top line'
              content='gpos.wizard.start.desc.txt-7'
            />
          </div>
        </div>
        <div className='gpos-modal__content-right'>
          <div disabled={ completedStages[1.1] } className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.1) }>
            <img className='gpos-modal__card-1' src='images/gpos/power-up.png' alt='step1'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.1'
            />
            {completedStages[1.1] ? this.renderCompleted(): null}
          </div>
          <div disabled={ completedStages[1.2] } className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.2) }>
            <img className='gpos-modal__card-2' src='images/gpos/power-down.png' alt='step2'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.2'
            />
            {completedStages[1.2] ? this.renderCompleted(): null}
          </div>
          <div disabled={ !canVote } className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(2) }>
            <img className='gpos-modal__card-3' src='images/gpos/vote.png' alt='step3'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.3'
            />
            {completedStages[2] ? this.renderCompleted(): null}
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

export default GposWizardStart;