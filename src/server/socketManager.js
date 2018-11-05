const io = require('./index').io;
const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  GLOBAL_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE,
  NEW_CHAT_USER
} = require('../events');
const { createUser, createMessage, createChat } = require('../factories');

let connectedUsers = {};
let globalChat = createChat({ isGlobal: true });

module.exports = function(socket) {

  let sendMessageToChatFromUser;
  let sendTypingFromUser;

  /**
   * verify user:
   * 1. on reconnect attempt (Layout.js)
   * 2. form was submitted on the front-end (LoginForm.js)
   *
   */
  socket.on(VERIFY_USER, (handle, setUserCallback) => {
    if (isUser(connectedUsers, handle)) {
      setUserCallback({ isUser: true, user: null });
    } else {
      setUserCallback({
        isUser: false,
        user: createUser({ name: handle, socketId: socket.id })
      });
    }
  });

  /**
   * user connects with new name:
   * 1. LoginForm calls the setUser in the Layout comp with a new user
   * 2
   */
  socket.on(USER_CONNECTED, user => {
    // attach the socket id from the incoming user to the userObject
    user.socketId = socket.id;
    // add the new user to the connectedUsers object so we can track them
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;
    sendMessageToChatFromUser = sendMessageToChat(user.name);
    sendTypingFromUser = sendTypingToChat(user.name);
    io.emit(USER_CONNECTED, connectedUsers);
  });

  socket.on('disconnect', () => {
    if ('user' in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, connectedUsers);
    }
  });

  socket.on(LOGOUT, user => {
    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
  });

  /**
   * called from cdm in chatContainer to initialize new global chat
   * cb returns a new chat obj created with our factory fn
   */
  socket.on(GLOBAL_CHAT, cb => cb(globalChat));

  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    sendMessageToChatFromUser(chatId, message);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    sendTypingFromUser(chatId, isTyping);
  });

  socket.on(PRIVATE_MESSAGE, ({ reciever, sender, activeChat }) => {
    if (reciever in connectedUsers) {
      const recieverSocket = connectedUsers[reciever].socketId;
      if (!activeChat || activeChat.id === globalChat.id) {
        const newChat = createChat({
          name: `${reciever} & ${sender}`,
          users: [reciever, sender]
        });
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
        socket.emit(PRIVATE_MESSAGE, newChat);
      } else {
        if (!(reciever in activeChat.users)) {
          activeChat.users
            .filter(user => user in connectedUsers)
            .map(user => connectedUsers[user])
            .map(user =>
              socket
                .to(user.socketId)
                .emit(NEW_CHAT_USER, {
                  chatId: activeChat.id,
                  newUser: reciever
                })
            );
            socket.emit(NEW_CHAT_USER, {chatId: activeChat.id, newUser: reciever})
        }
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat);
      }
    }
  });

  function sendTypingToChat(user) {
    return (chatId, isTyping) => {
      io.emit(`${TYPING}-${chatId}`, { user, isTyping });
    };
  }

  function sendMessageToChat(sender) {
    return (chatId, message) => {
      io.emit(
        `${MESSAGE_RECIEVED}-${chatId}`,
        createMessage({ message, sender })
      );
    };
  }

  function addUser(userList, handle) {
    let newList = Object.assign({}, userList);
    newList[handle.name] = handle;
    return newList;
  }

  function removeUser(userList, handle) {
    let newList = Object.assign({}, userList);
    delete newList[handle];
    return newList;
  }

  // check if the user is in the list passed in
  function isUser(userList, handle) {
    return handle in userList;
  }
};
