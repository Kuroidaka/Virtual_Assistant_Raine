const generateController = require("./generate")
const uploadFileController = require("./uploadFile")
const deleteFileController = require("./deleteFile")


module.exports = (dependencies) => {
    return {
        generateController: generateController(dependencies),
        uploadFileController: uploadFileController(dependencies),
        deleteFileController: deleteFileController(dependencies),
    }
}