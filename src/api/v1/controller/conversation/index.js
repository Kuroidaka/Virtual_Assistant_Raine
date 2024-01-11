const createChatController = require("./createChat")
const delChatController = require("./delChat")
const getChatController = require("./getChat")

module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),
        delChatController: delChatController(dependencies),
        getChatController: getChatController(dependencies),

    }
}