import React from 'react';
import Translate from 'react-translate-component';

class GposWizardStart extends React.Component {
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
          <div className='gpos-modal__card' onClick={ () => proceedOrRegress(1.1) }>
            <img className='gpos-modal__card-1' src='images/gpos/power-up.png' alt='step1'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.1'
            />
          </div>
          <div disabled className='gpos-modal__card' onClick={ () => proceedOrRegress(1.2) }>
            <img className='gpos-modal__card-2' src='images/gpos/power-down.png' alt='step2'/>
            <Translate
              component='p'
              className='gpos-modal__card-txt'
              content='gpos.wizard.start.right.2'
            />
          </div>
          <div className='gpos-modal__card' onClick={ () => proceedOrRegress(2) }>
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