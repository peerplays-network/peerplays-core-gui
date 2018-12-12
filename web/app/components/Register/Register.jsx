/*
 *  Copyright (c) 2015 Cryptonomex, Inc., and contributors.
 *
 *  The MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import React from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import Logo from '../Forms/Logo';
import RegisterForm from './RegisterForm';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import RegisterActions from 'actions/RegisterActions';
import NavigateActions from 'actions/NavigateActions';

@connect(
  (state) => {
    return {
      registerStatus: state.register.status,
      errors: state.register.errors,
    };
  },
  {
    setRegisterStatus: RegisterActions.setRegisterStatus,
    register: RegisterActions.register,
    navigateToSignIn: NavigateActions.navigateToSignIn
  }
)
class Register extends React.Component {
  handleSubmit(values) {
    this.props.setRegisterStatus('loading');
    setTimeout(() => {
      this.props.register(values.accountName, values.password);
    }, 0);
  }

  onClickLogin() {
    this.props.navigateToSignIn(null, false);
  }

  render() {
    return (
      <div className='main'>
        <div className='yHelper'></div>
        <section className='content'>
          <div className='box box-inPadding'>
            <div className='dialog dialog-login'>
              <LanguageSwitcher />
              <Logo />
              <Translate
                component='h1'
                className='h1'
                content='sign_up.welcome'
                tm={ <span className='tm'>TM</span> }
              />
              <Translate component='h2' className='h2' content='sign_up.please_create' />
              <div className='form'>
                <RegisterForm
                  errors={ this.props.errors }
                  registerStatus={ this.props.registerStatus }
                  onClickLogin={ this.onClickLogin.bind(this) }
                  onSubmit={ this.handleSubmit.bind(this) }
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
export default Register;