const createChatController = require("./createChat")
const uploadFileController = require("./uploadFile")
const uploadImageController = require("./imageFile")
const camChatController = require("./camChat")
const deleteCamChatCon = require("./deleteCamChatCon")
const storeDataCamChatController = require("./storeDataCamChat")
const getDataChatCamController = require("./getDataChatCam")


module.exports = (dependencies) => {
    return {
        createChatController: createChatController(dependencies),
        uploadFileController: uploadFileController(dependencies),
        uploadImageController: uploadImageController(dependencies),
        camChatController: camChatController(dependencies),
        deleteCamChatCon: deleteCamChatCon(dependencies),
        storeDataCamChatController: storeDataCamChatController(dependencies),
        getDataCamChatController : getDataChatCamController(dependencies)
    }
}