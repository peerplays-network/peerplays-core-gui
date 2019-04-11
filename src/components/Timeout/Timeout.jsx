import React from 'react';
import {connect} from 'react-redux';
import {LoginActions, AppActions} from '../../actions';
import Translate from 'react-translate-component';
import {bindActionCreators} from 'redux';
import TimeoutLoginForm from './TimeoutLoginForm';

class Timeout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password_input: '',
      password_error: null
    };
  }

  onPasswordChange(e) {
    this.setState({password_input: e.target.value});
  }

  onExit() {
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
      this.props.login(this.props.account, values.password, true, next);
    }, 0);
  }

  render() {
    return (
      <div className='main'>
        <div className='yHelper active'></div>
        <section className='content'>
          <div className='box box-inPadding'>
            <div className='dialog dialog-login padding-bottom-30'>
              <Translate
                component='h1'
                className='h1'
                content='timeout.title'
              />
              <div className='section__text text_c'>
                <span>
                  <Translate className='' content='timeout.body_part_1'/>
                  {this.props.account}
                  <Translate className='' content='timeout.body_part_2'/>
                </span>
              </div>

              <div className='login__footer small'>
                <TimeoutLoginForm errors={ this.props.errors } btnStatus={ this.props.status }
                  account={ this.props.account } onSubmit={ this.handleSubmit.bind(this) } onExit={ this.onExit.bind(this) } />
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

export default connect(mapStateToProps, mapDispatchToProps)(Timeout);