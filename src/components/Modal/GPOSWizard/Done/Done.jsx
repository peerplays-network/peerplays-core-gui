import React from 'react';
import Translate from 'react-translate-component';

class Done extends React.PureComponent {
  render() {
    return(
      <div className='gpos-modal__done'>
        <div className='gpos-modal__done-left'>

        </div>
        <div className='gpos-modal__done-right'>
          <Translate
            component='p'
            className='title'
            content='gpos.wizard.step-3.title'
          />
          <Translate
            component='p'
            className='txt--spaced'
            content='gpos.wizard.step-3.text-1'
          />
          <ul className='gpos-modal__done-right list'>
            <Translate
              component='li'
              className='txt--li'
              content='gpos.wizard.step-3.text-2'
            />
            <Translate
              component='li'
              className='txt--li'
              content='gpos.wizard.step-3.text-3'
            />
            <Translate
              component='li'
              className='txt--li'
              content='gpos.wizard.step-3.text-4'
            />
          </ul>
        </div>
      </div>
    );
  }
}

export default Done;