import React from 'react';
import {connect} from 'react-redux';
import counterpart from 'counterpart';
import {LoginActions, AppActions} from '../../actions';
import Translate from 'react-translate-component';
import {bindActionCreators} from 'redux';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password_input: '',
      password_error: null
    };
  }

  login() {
    this.props.login();
    console.log('reconnect');
  }

  onPasswordChange(e) {
    this.setState({password_input: e.target.value});
  }

  onExit() {
    console.log('props: ', this.props);
    this.props.logout();
    console.log('exiting');
  }

  handleSubmit(values) {
    let next;

    if (this.props.location.query && this.props.location.query.next) {
      next = this.props.location.query.next;
    }

    this.props.setLoginStatus('loading');

    setTimeout(() => {
      this.props.login(values.accountName, values.password, values.remember_me, next);
    }, 0);
  }

  render() {
    console.log('account: ', this.props.account);
    let {password_input, password_error} = this.state;

    return (
      <div className='main'>
        <div className='yHelper active'></div>
        <section className='content'>
          <div className='box box-inPadding'>
            <div className='dialog dialog-login'>
              <Translate
                component='h1'
                className='h1'
                content='timeout.title'
              />
              <div className='section__text text_c'>
                <span>
                  <Translate component='p' className='' content='timeout.body_part_1'/>
                  {this.props.account}
                  <Translate component='p' className='' content='timeout.body_part_2'/>
                </span>
              </div>

              <div className='login__footer'>
                <input
                  type='password'
                  className={ `field field-type2 ${password_error ? 'error' : null}` }
                  placeholder={ counterpart.translate('modal.unlock.password_placeholder') }
                  onChange={ this.onPasswordChange.bind(this) }
                  value={ password_input }
                  autoFocus={ true }
                />
                <button
                  className='btn btn-sign btn-fsz-18'
                  onClick={ this.onExit.bind(this) }
                >
                  <Translate className='btnText' content='timeout.exit' />
                </button>
                <button
                  className='btn btn-sign btn-fsz-18'
                  onClick={ this.handleSubmit.bind(this) }
                >
                  <Translate className='btnText' content='timeout.sign_in' />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.loginPage.status,
    errors: state.loginPage.errors,
    account: state.app.account,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    login: LoginActions.login,
    setLoginStatus: LoginActions.setLoginStatus,
    logout: AppActions.logout
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Login);