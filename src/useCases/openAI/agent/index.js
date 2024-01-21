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


    const listToolsSpec = [
        weatherFunc.funcSpec,
        reminderFunc.funcSpec,
        followUpImageFunc.funcSpec,
        generateImageFunc.funcSpec,
        browseFunc.funcSpec,
        askAboutDocsFunc.funcSpec,
        dbChatFunc.funcSpec
    ]
    return {
        tools: {
            "get_current_weather": weatherFunc,
            "create_reminder": reminderFunc,
            "browse": browseFunc,
            "ask_about_document": askAboutDocsFunc,
            "database_chat": dbChatFunc,
            "follow_up_image_in_chat": followUpImageFunc,
            "generate_image": generateImageFunc,
        },
        listToolsSpec
    }
}







