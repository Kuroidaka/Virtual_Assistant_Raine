const generateController = require("./ask/generate")
const uploadFileController = require("./file/uploadFile")
const deleteFileController = require("./file/deleteFile")
const getFileController = require("./file/getFile")


module.exports = (dependencies) => {
    return {
        generateController: generateController(dependencies),
        uploadFileController: uploadFileController(dependencies),
        deleteFileController: deleteFileController(dependencies),
        getFileController: getFileController(dependencies),
    }
}