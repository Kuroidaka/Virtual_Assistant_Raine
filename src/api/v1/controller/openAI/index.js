const generateController = require("./generate")
const uploadFileController = require("./uploadFile")


module.exports = (dependencies) => {
    return {
        generateController: generateController(dependencies),
        uploadFileController: uploadFileController(dependencies),
    }
}