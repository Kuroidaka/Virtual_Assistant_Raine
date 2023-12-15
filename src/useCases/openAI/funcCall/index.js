const weatherFunc = require("./weather")
const followUpImageFunc = require("./follow_up_image")
const reminder = require("./reminder")



module.exports = (dependencies) => { 
    const reminderFunc = new reminder(dependencies)

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