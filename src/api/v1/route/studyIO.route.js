const express = require('express')
const multer = require('multer');
const storage = require("../middleware/storeFile")
const studyIOController = require('../controller/studyIO')

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log("file", file)
        cb(null, true);
    },
    limits: {
    //   fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
    },
});


module.exports = (dependencies) => {
    const router = express.Router()

    const {
        createChatController,
        uploadFileController

    } = studyIOController(dependencies)

    router  
        .route("/create")
        .post(createChatController)
    
    router  
        .route("/file/upload")
        .post(upload.array('files'), uploadFileController)
    

    return router
}