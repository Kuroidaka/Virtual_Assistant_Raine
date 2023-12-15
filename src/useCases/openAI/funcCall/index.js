const weatherFunc = require("./weather")
const followUpImageFunc = require("./follow_up_image")
const reminderClass = require("./reminder")

module.exports = () => { 
    const dependencies = require("../../../config/dependencies")
    const reminderFunc = new reminderClass(dependencies)

    const listFuncSpec = [
        weatherFunc.funcSpec,
        reminderFunc.funcSpec,
        followUpImageFunc.funcSpec
    ]
    return {
        func: {
            weatherFunc,
            reminderFunc,
            followUpImageFunc
        },
        listFuncSpec
    }
}