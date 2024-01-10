const fs = require('fs');
const path = require('path');

function deleteFilesInDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      fs.unlinkSync(filePath);
    });

    console.log('All files in the directory have been deleted.');
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}

module.exports = deleteFilesInDirectory

// // Usage:
// const directoryPath = 'src/assets/tmpDocs'; 

// deleteFilesInDirectory(directoryPath);