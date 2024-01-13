const createChatController = require("../studyIO/createChat")
const uploadFileController = require("../studyIO/uploadFile")

module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),
        uploadFileController: uploadFileController(dependencies),

    }
}