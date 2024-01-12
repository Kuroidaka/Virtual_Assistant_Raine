const express = require('express')

const studyIOController = require('../controller/studyIO')

module.exports = (dependencies) => {
    const router = express.Router()

    const {
        createChatController,

    } = studyIOController(dependencies)

    router  
        .route("/create")
        .post(createChatController)
    

    return router
}