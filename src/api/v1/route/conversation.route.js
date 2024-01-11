const express = require('express')

const conversationController = require('../controller/conversation')

module.exports = (dependencies) => {
    const router = express.Router()

    const {
        createChatController,
        delChatController,
        getChatController

    } = conversationController(dependencies)

    router  
        .route("/create")
        .post(createChatController)
    
    router  
        .route("/delete")
        .post(delChatController)
    
    router  
        .route("/get")
        .get(getChatController)
    
    

    return router
}