import React from 'react';
import Translate from 'react-translate-component';

class GposWizardStart extends React.Component {
  // TODO: on power up/down, use redux state to track successful transactions and reflect the changes here. Store as array of transactions completed.
  // renderCompleted = (action) => {
  renderCompleted = () => {
    // TODO: actions array from state storing the compelted actions.
    // const isComplete = (action) => {
    //   let index = actions.indexOf(action);

    //   if (index !== -1) {
    //     console.log(`${action} is complete @ ${index}`);
    //   }
    // };

    return(
      <Translate
        component='span'
        className='gpos-modal__card-txt completed'
        content='gpos.wizard.completed'
      />
    );
  }

  render() {
    let {closeModal, proceedOrRegress} = this.props;

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
          <div className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.1) }>
            <img className='gpos-modal__card-1' src='images/gpos/power-up.png' alt='step1'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.1'
            />
          </div>
          <div disabled className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(1.2) }>
            <img className='gpos-modal__card-2' src='images/gpos/power-down.png' alt='step2'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.2'
            />
            {this.renderCompleted()}
          </div>
          <div className='gpos-modal__card-btn' onClick={ () => proceedOrRegress(2) }>
            <img className='gpos-modal__card-3' src='images/gpos/vote.png' alt='step3'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.3'
            />
          </div>
          <div className='gpos-modal__btns'>
            <button className='gpos-modal__btn-cancel' onClick={ closeModal }>
              <Translate className='gpos-modal__btn-txt' content='gpos.wizard.cancel'/>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GposWizardStart;