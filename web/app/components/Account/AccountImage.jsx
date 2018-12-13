import React from 'react';
import Identicon from './Identicon';
import {PropTypes, Component} from 'react';

class AccountImage extends Component {
  render() {
    let {account, image} = this.props;
    let {height, width} = this.props.size;
    let custom_image = image
      ? <img alt='indenticon' src={ image } height={ height + 'px' } width={ width + 'px' }/>
      : <Identicon id={ account } account={ account } size={ this.props.size }/>;
    return (
      <div className='account-image'>
        {custom_image}
      </div>
    );
  }
}

AccountImage.defaultProps = {
  src: '',
  account: '',
  size: {
    height: 120,
    width: 120
  }
};

AccountImage.propTypes = {
  src: PropTypes.string,
  account: PropTypes.string,
  size: PropTypes.object.isRequired
};

export default AccountImage;
