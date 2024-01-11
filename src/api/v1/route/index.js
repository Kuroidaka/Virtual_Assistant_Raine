const express = require("express");

const openAIRouter = require("./chatgpt.route")
const conversationRouter = require("./conversation.route")
// const weather = require("./weather.route")


module.exports = (dependencies) => {
    const router = express.Router()

    const openAI = openAIRouter(dependencies)
    const conversation = conversationRouter(dependencies)

    router.use('/openai', openAI)
    router.use('/conversation', conversation)
    
    // router.use('/api/v1/weather', weather)

    return router
}