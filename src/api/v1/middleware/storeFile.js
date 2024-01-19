const multer = require('multer');
const path = require('path')

const storageDocs = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/assets/tmpDocs/'); // Specify the destination folder to store the uploaded docs
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname
        cb(null, fileName);
    }
});

const storageImg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/assets/img'); // Specify the destination folder to store the uploaded image
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname
        cb(null, fileName);
    }
});

module.exports = {
    storageDocs,
    storageImg
}