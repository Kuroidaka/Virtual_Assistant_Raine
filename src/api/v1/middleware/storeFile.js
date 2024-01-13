const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/assets/tmpDocs/'); // Specify the destination folder to store the uploaded image
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname
        cb(null, fileName);
    }
});

module.exports = storage