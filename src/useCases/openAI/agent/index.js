const weatherFunc = require("./weather")
const followUpImageFunc = require("./follow_up_image")
const generateImage = require("./generateImage")
const askAboutDocs = require("./read_file/QA_file")
const browse = require("./browse/browse")
const dbChat = require("./db_chat")
const reminderClass = require("./reminder/reminder")

module.exports = ({dependencies}) => { 
    const reminderFunc = new reminderClass(dependencies)
    const generateImageFunc = generateImage(dependencies)
    const browseFunc = browse(dependencies)
    const askAboutDocsFunc = askAboutDocs(dependencies)
    const dbChatFunc = dbChat(dependencies)


    const listFuncSpec = [
        weatherFunc.funcSpec,
        reminderFunc.funcSpec,
        followUpImageFunc.funcSpec,
        generateImageFunc.funcSpec,
        browseFunc.funcSpec,
        askAboutDocsFunc.funcSpec,
        dbChatFunc.funcSpec
    ]
    return {
        func: {
            weatherFunc,
            reminderFunc,
            followUpImageFunc,
            generateImageFunc,
            browseFunc,
            askAboutDocsFunc,
            dbChatFunc
        },
        listFuncSpec
    }
}