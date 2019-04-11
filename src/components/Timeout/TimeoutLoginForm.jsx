import React from 'react';
import {Field, reduxForm} from 'redux-form';
import {ChainValidation} from 'peerplaysjs-lib';
import Translate from 'react-translate-component';
import AccountRepository from 'repositories/AccountRepository';
import {LoginActions} from '../../actions';
import Normalize from '../Utility/Normalizer';

const renderField = ({
  tabIndex,
  className,
  errors,
  placeholder,
  input,
  type,
  iconClass,
  meta: {
    touched,
    error
  }
}) => (
  <label className='row'>
    <Translate
      component='input'
      autoFocus={ tabIndex === '1' }
      autoComplete='off' { ...input }
      type={ type }
      placeholder={ placeholder }
      tabIndex={ tabIndex }
      className={ (touched && error)
        ? (className + ' error')
        : className }
      attributes={ {placeholder: placeholder} }
    />
    <span className='fieldPic'>
      <span className={ iconClass }/>
    </span>
    {(touched) && error && <span className='error__hint'>{error}</span>}
    {!error && errors && errors.length ? errors.map((err) => {
      return (<span className='error__hint' key={ err }>{err}</span>);
    }) : <span className='error__hint'>&nbsp;</span>}
  </label>
);


class TimeoutLoginForm extends React.Component {

  render () {
    const {
      handleSubmit,
      btnStatus,
      errors,
      invalid,
      asyncValidating,
      submitting,
      onExit
    } = this.props;

    let RestoreBtn;

    switch(btnStatus) {
      case 'default':
        RestoreBtn = (
          <button
            className='btn btn-sbm btn-fsz-18'
            type='submit'
            disabled={ invalid || submitting || asyncValidating }>
            <Translate className='btnText' content='login.login_btn' />
          </button>
        );
        break;
      case 'loading':

        RestoreBtn = (
          <button
            className='btn btn-sbm btn-fsz-18 btn-loader'
            type='button'
            disabled={ true }
          >
            <span className='loader loader-white loader-xs'/>
          </button>
        );
        break;
      case 'done':
        RestoreBtn = (
          <button className='btn btn-sbm btn-fsz-18'  disabled={ true }>
            <span className='loaderIcon icon-verify'/>
            <Translate className='btnText' content='buttons.done' />
          </button>
        );
        break;
    }

    return (
      <form onSubmit={ handleSubmit }>
        <Field
          name='password'
          className='field field-pic'
          iconClass='fieldIcon icon-password'
          errors={ errors }
          component={ renderField }
          placeholder='login.login_form_login_password_placeholder'
          type='password'
          tabIndex='2'
        />
        <div className='login__options'>
          <button className='btn btn-sbm btn-fsz-18' onClick={ onExit }>
            <Translate className='btnText' content='timeout.exit' />
          </button>
          {RestoreBtn}
        </div>
      </form>
    );
  }
}

// Decorate the form component
TimeoutLoginForm = reduxForm({
  form: 'loginForm', // a unique name for this form,
  validate: function submit(values) {
    const errors = {};

    let MAX_PASSWORD_CHARACTERS = 22;

    if (!values.password || values.password.length < MAX_PASSWORD_CHARACTERS) {
      errors.password = (
        <Translate
          content='errors.password_must_be_X_characters_or_more'
          cnt={ MAX_PASSWORD_CHARACTERS }
        />
      );
    }

    return errors;
  },
  asyncValidate: (values, dispatch, props,) => {
    return AccountRepository.lookupAccounts(props.account, 100).then((result) => {
      let account = result.find((a) => a[0] === props.account);

      if (!account) {
        dispatch(LoginActions.setLoginAccount(null));
        throw {accountName: <Translate content='errors.account_not_found' />};
      } else {
        dispatch(LoginActions.setLoginAccount(account));
      }
    });
  },
  asyncBlurFields: [ 'accountName' ]
})(TimeoutLoginForm);

export default TimeoutLoginForm;