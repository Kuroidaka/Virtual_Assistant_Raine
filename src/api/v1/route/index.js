const express = require("express");

const openAIRouter = require("./chatgpt.route")
// const weather = require("./weather.route")


module.exports = (dependencies) => {
    const router = express.Router()

    const openAI = openAIRouter(dependencies)

    router.use('/openai', openAI)
    // router.use('/api/v1/weather', weather)

    return router
}