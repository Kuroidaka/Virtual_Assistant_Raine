const createChatController = require("../studyIO/createChat")
const uploadFileController = require("../studyIO/uploadFile")
const uploadImageController = require("../studyIO/imageFile")

module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),
        uploadFileController: uploadFileController(dependencies),
        uploadImageController: uploadImageController(dependencies),

    }
}