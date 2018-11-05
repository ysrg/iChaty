import React, { Component } from 'react';
import { FaArrowCircleUp } from 'react-icons/fa';
import {VERIFY_USER} from '../events';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      handle: '',
      error: ''
    }
  }

  setUser = ({isUser, user}) => {
    if(isUser) {
      this.setError("Username taken")
    } else {
      this.setError(null)
      this.props.setUser(user)
    }
  }

  /**
   * Emit to the server and send the input handle so we
   * can verify the user. The setUser cb will be called
   * by the server with the response -> if a user already exists -
   * an error is thrown, else - call local setUser that subsequently
   * calls the setUser fn in the ChatContainer comp via props
   */
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.socket.emit(VERIFY_USER, this.state.handle, this.setUser)
  }

  handleChange = (e) => {
    this.setState({handle: e.target.value})
  }

  setError = (error) => {
    this.setState({error})
  }

  render() {
    const {handle, error} = this.state;
    return (
      <div className="login">
        <form onSubmit={this.handleSubmit} className="login-form">
        <div className="logo">iChaty</div>
          <input
            placeholder="Your handle..."
            autoFocus
            ref={(input) => { this.textInput = input}}
            type="text"
            id="nickname"
            value={handle}
            onChange={this.handleChange}
          />
          <button type="submit" className="enter-btn">
            <FaArrowCircleUp/>
          </button>
          <div className="error">
            {error ? error : null}
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForm;
