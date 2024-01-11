const express = require('express')

const openAIController = require('../controller/openAI')


// router.post('/image/edit', chatgpt.editImage)

module.exports = (dependencies) => {
    const router = express.Router()

    const {
        generateController,
        uploadFileController,
        deleteFileController,
        getFileController
        // askForFunction,
        // generateForTTS,
        // generateImg,
        // translate,
    } = openAIController(dependencies)

    router  
        .route("/ask")
        .post(generateController)
    
    router  
        .route("/upload-file")
        .post(uploadFileController)
    
    router
        .route("/del-file")
        .post(deleteFileController)
    
    router
        .route("/get-file")
        .get(getFileController)

    // router
    //     .route('/ask-for-tts')
    //     .post(generateForTTS)

    // router
    //     .route('/ask-for-func')
    //     .post(askForFunction)
    
    // router
    //     .route('/trans')
    //     .post(translate)
    
    // router
    //     .route('/image/ask')
    //     .post(generateImg)

    return router
}