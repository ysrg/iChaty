import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { values, difference, differenceBy } from 'lodash';
import SideBar from './Sidebar';
import {
  GLOBAL_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE,
  USER_CONNECTED,
  USER_DISCONNECTED,
  NEW_CHAT_USER
} from '../../events';
import Messages from '../Messages/Messages';
import MessageInput from '../Messages/MessageInput';

class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      users: [],
      activeChat: null,
      width: Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
    };
  }
  componentDidMount() {
    // this.setActiveChat(this.state.chats[0])
    var self = this;
    window.addEventListener('resize', function(event) {
      self.setState({
        width: Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        )
      });
    });
    /**
     * Initiates a new chat. The response from the server
     * will be a chat object that will be passed to resetChat fn
     * This way we can set the global chat as the activeChat autmatically
     * without the need to select it manualy
     */
    this.props.socket.emit(GLOBAL_CHAT, this.resetChat);
    this.initSocket(this.props.socket);
  }


  componentWillUnmount() {
    this.props.socket.off(PRIVATE_MESSAGE);
    this.props.socket.off(USER_CONNECTED);
    this.props.socket.off(USER_DISCONNECTED);
    this.props.socket.off(NEW_CHAT_USER);
  }

  initSocket(socket) {
    socket.on(PRIVATE_MESSAGE, this.addChat);
    socket.on('connect', () => {
      socket.emit(GLOBAL_CHAT, this.resetChat);
    });
    socket.on(USER_CONNECTED, users => {
      this.setState({ users: values(users) });
    });
    socket.on(USER_DISCONNECTED, users => {
      const removedUsers = differenceBy(this.state.users, values(users));
      this.removeUsersFromChat(removedUsers);
      this.setState({ users: values(users) });
    });
    socket.on(NEW_CHAT_USER, this.addUserToChat);
  }

  sendOpenPrivateMessage = reciever => {
    this.props.socket.emit(PRIVATE_MESSAGE, {
      reciever,
      sender: this.props.user.name,
      activeChat: this.state.activeChat
    });
  };
  // we will get chatid and newUser from the backend
  addUserToChat = ({ chatId, newUser }) => {
    const newChats = this.state.chats.map(chat => {
      if (chat.id === chatId) {
        return Object.assign({}, chat, { users: [...chat.users, newUser] });
      }
      return chat;
    });
    this.setState({ chats: newChats });
  };

  removeUsersFromChat = removedUsers => {
    const newChats = this.state.chats.map(chat => {
      let newUsers = difference(chat.users, removedUsers.map(u => u.name));
      // spread operator works just like Object.assign in the prev method
      return { ...chat, users: newUsers };
    });
    this.setState({ chats: newChats });
  };

  // reset the chat back to the one passed in
  resetChat = chat => this.addChat(chat, true);

  /**
   * The logic for adding the chats to our state. When a `true`
   * reset parameter is passed, it means we want to reset our chat just
   * to the global one, otherwise push the passed-in chat to our chats array.
   * Also, set the new chat to the activeChat state prop
   */
  addChat = (chat, reset = false) => {
    /**
     * if reset=true -> we emited the global_chat action and the state
     *  will be reset to just the global chat
     */
    const newChats = reset ? [chat] : [...this.state.chats, chat];
    /**
     * activeChat will become whaterver chat wass passed in to the addChat fn,
     * by default it will be the global chat
     */
    this.setState({ chats: newChats, activeChat: chat });
    const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
    const typingEvent = `${TYPING}-${chat.id}`;
    this.props.socket.on(typingEvent, this.updateTypingInChat(chat.id));
    this.props.socket.on(messageEvent, this.addMessageToChat(chat.id));
  };

  addMessageToChat(chatId) {
    return msg => {
      let newChats = this.state.chats.map(chat => {
        if (chat.id === chatId) {
          chat.messages.push(msg);
        }
        return chat;
      });
      this.setState({ chats: newChats });
    };
  }

  updateTypingInChat = chatId => {
    return ({ isTyping, user }) => {
      if (user !== this.props.user.name) {
        let newChats = this.state.chats.map(chat => {
          if (chat.id === chatId) {
            if (isTyping && !chat.typingUsers.includes(user)) {
              chat.typingUsers.push(user);
            } else if (!isTyping && chat.typingUsers.includes(user)) {
              chat.typingUsers = chat.typingUsers.filter(u => u !== user);
            }
          }
          return chat;
        });
        this.setState({ chats: newChats });
      }
    };
  };

  // Sends the message to the specified chat
  sendMessage = (chatId, message) => {
    this.props.socket.emit(MESSAGE_SENT, { chatId, message });
  };

  // Sends typing status to the server
  sendTyping = (chatId, isTyping) => {
    this.props.socket.emit(TYPING, { chatId, isTyping });
  };

  setActiveChat = activeChat => {
    this.setState({ activeChat });
  };
  render() {
    const { user, logout } = this.props;
    const { chats, activeChat, users, width } = this.state;
    return (
      <Container>
        <Row>
            <Col md="3">
            <SideBar
              name={activeChat ? activeChat.name : 'Hiu'}
              logout={logout}
              chats={chats}
              user={user}
              users={users}
              activeChat={activeChat}
              width={width}
              setActiveChat={this.setActiveChat}
              onSendPrivateMessage={this.sendOpenPrivateMessage}
            />
            </Col>
          <Col md="9">
          <div className="chat-room-container">
            {activeChat !== null ? (
              <div className="chat-room">
                {/* <ChatHeading name={activeChat.name} /> */}
                <Messages
                  messages={activeChat.messages}
                  user={user}
                  typingUsers={activeChat.typingUsers}
                />
                <MessageInput
                  sendMessage={message =>
                    this.sendMessage(activeChat.id, message)
                  }
                  sendTyping={isTyping =>
                    this.sendTyping(activeChat.id, isTyping)
                  }
                />
              </div>
            ) : (
              <div className="chat-room choose">
                <h3>Choose a chat!</h3>
              </div>
            )}
          </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default ChatContainer;
