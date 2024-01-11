const getFileExtension = (fileName) => {
    let lastDotPosition = fileName.lastIndexOf(".");
    let fileExtension = fileName.substring(lastDotPosition + 1);

    return fileExtension
}

module.exports = getFileExtension;

// // Usage:
// const fileName = 'file.docx'; 

// console.log(getFileExtension(fileName))
