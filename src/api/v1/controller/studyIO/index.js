const createChatController = require("../studyIO/createChat")

module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),

    }
}