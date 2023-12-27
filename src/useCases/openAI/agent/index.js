const weatherFunc = require("./weather")
const followUpImageFunc = require("./follow_up_image")
const generateImage = require("./generateImage")
const browse = require("./browse")
const reminderClass = require("./reminder/reminder")

module.exports = () => { 
    const dependencies = require("../../../config/dependencies")
    const reminderFunc = new reminderClass(dependencies)
    const generateImageFunc = generateImage(dependencies)
    const browseFunc = browse(dependencies)

    const listFuncSpec = [
        weatherFunc.funcSpec,
        reminderFunc.funcSpec,
        followUpImageFunc.funcSpec,
        generateImageFunc.funcSpec,
        browseFunc.funcSpec
    ]
    return {
        func: {
            weatherFunc,
            reminderFunc,
            followUpImageFunc,
            generateImageFunc,
            browseFunc
        },
        listFuncSpec
    }
}