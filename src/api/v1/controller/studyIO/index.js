const createChatController = require("./createChat")
const uploadFileController = require("./uploadFile")
const uploadImageController = require("./imageFile")
const camChatController = require("./camChat")
const deleteCamChatCon = require("./deleteCamChatCon")
module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),
        uploadFileController: uploadFileController(dependencies),
        uploadImageController: uploadImageController(dependencies),
        camChatController: camChatController(dependencies),
        deleteCamChatCon: deleteCamChatCon(dependencies),

    }
}