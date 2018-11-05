const uuidv4 = require('uuid/v4');

/**
 * ? d
 * ! d
 * // f
 * todo a
 * * f
 */

/**
 *  create a user
 */

const createUser = ({name = '', socketId = null} = {}) => (
  {
    id: uuidv4(),
    name,
    socketId
  }
)

/**
 *  create a messages object
 */

 const createMessage = ({message = '', sender = ''} = {}) => {
   return {
     id: uuidv4(),
     time: getTime(new Date(Date.now())),
     message,
     sender
   }
  }

/**
* create a Chat object
*/

 const createChat = ({messages = [], name = "hui1", users = [], isGlobal = false} = {}) => {
   return {
     id: uuidv4(),
     name: isGlobal ? 'Home' : createChatNameFromUsers(users),
     messages,
     users,
     typingUsers: [],
     isGlobal
   }
  }


 function createChatNameFromUsers(users, excludeUser = '') {
   return users.filter(u => u !== excludeUser).filter((el, i, ar) =>{
    return ar.indexOf(el) === i}).join(', ')
 }

 const getTime = (date) => {
   return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
 }

 module.exports = {
   createMessage,
   createChat,
   createUser,
   createChatNameFromUsers
 }
