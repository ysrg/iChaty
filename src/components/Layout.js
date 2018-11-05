import React, { Component } from 'react';
import io from 'socket.io-client';
import LoginForm from './LoginForm';
import ChatContainer from './chats/ChatContainer';
import { USER_CONNECTED, LOGOUT, VERIFY_USER } from '../events';

// const socketUrl = 'http://192.168.100.3:3231/';
const socketUrl = '/';
class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      user: null
    };
  }

  componentWillMount() {
    this.initSocket();
  }

  /**
   * On phones, when swithing screens or locking them, the user
   * disconnects from the server even though he is still
   * logged in. We make use of reconnect fn to connect them back
   */
  reconnect = (socket) => {
    //emit to the server so we can handle the req in socketmanager.js
    socket.emit(VERIFY_USER, this.state.user.name, ({isUser, user}) => {
      // fn called back by the server with the results
      if(isUser) {
        //checking for existing users
        this.state({user: null})
      } else {
        this.setUser(user)
      }
    })
  }

  /**
   * Initiate socket.io first and set it in the local state,
   * so we can pass it around (eg as props to children components)
   */
  initSocket = () => {
    const socket = io(socketUrl);
    socket.on('connect', () => {
      if(this.state.user) {
        this.reconnect(socket)
      }
      return null
    });
    this.setState({
      socket
    });
  };

  /**
   * setUser will be called from the LoginForm comp. if there is
   * no user already logged in (user is null in our local state).
   * But if we have a user we dont need to call this fn as we will
   * render the ChatContainer instead(or after the user in the state is set)
   */
  setUser = user => {
    this.state.socket.emit(USER_CONNECTED, user);
    this.setState({ user });
  };

  /**
   * Logout it the opposite of the setUser fn. We pass it to the
   * chatContainer comp as prop because we already have a user
   * connected/loggedIn if this comp is rendered
   */
  logout = () => {
    //logout action emited so we can disconnect the user on the server
    this.state.socket.emit(LOGOUT);
    this.setState({ user: null });
  };

  render() {
    const { socket, user } = this.state;
    return (
      <div className="layout">
        {!user ? (
          <LoginForm socket={this.state.socket} setUser={this.setUser} />
        ) : (
          <ChatContainer socket={socket} user={user} logout={this.logout} />
        )}
      </div>
    );
  }
}

export default Layout;
