const createConversation = require('./createConversation');
const createMessage = require('./createMessage');
const delConversation = require('./delConversation');
const getConversations = require('./getConversation');
const updateLastMsgCon = require('./updateLastMsgCon');


module.exports = {
    createConversation,
    delConversation,
    createMessage,
    getConversations,
    updateLastMsgCon
}