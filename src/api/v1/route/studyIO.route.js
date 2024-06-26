const express = require('express')
const multer = require('multer');
const { storageDocs, storageImg } = require("../middleware/storeFile")
const studyIOController = require('../controller/studyIO')

const uploadDocs = multer({
    storage: storageDocs,
    fileFilter: function (req, file, cb) {
        console.log("file", file)
        cb(null, true);
    },
    limits: {
    //   fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
    },
});
const uploadImg = multer({
    storage: storageImg,
    fileFilter: function (req, file, cb) {
        console.log("file-img", file)
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
        uploadFileController,
        uploadImageController,
        camChatController,
        deleteCamChatCon,
        storeDataCamChatController,
        getDataCamChatController
    } = studyIOController(dependencies)

    router  
        .route("/create")
        .post(createChatController)

    router  
        .route("/cam")
        .post(camChatController)

    router  
        .route("/cam/store")
        .post(storeDataCamChatController)
    
    router  
        .route("/cam/get")
        .get(getDataCamChatController)

    router  
        .route("/cam/delete")
        .post(deleteCamChatCon)
    
    router  
        .route("/file/upload")
        .post(uploadDocs.array('files'), uploadFileController)
    
    router  
        .route("/file/img/upload")
        .post(uploadImg.array('files'), uploadImageController)
    

    return router
}