const fs = require('fs');
const path = require('path');

const deleteFile = (dir, file) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dir, file);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File does not exist: ${filePath}`);
        resolve(false);
      } else {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
            resolve(false);
          } else {
            console.log(`File deleted successfully: ${filePath}`);
            resolve(true);
          }
        });
      }
    });
  });
}

module.exports = deleteFile;

// Usage:
// deleteFile('src/assets/tmpDocs', 'so-lieu.docx');