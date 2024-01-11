const fs = require('fs');

const isDirectoryEmpty = async (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        resolve(false);
      } else {
        if (files.length === 0) {
          console.log(`Directory is empty: ${dir}`);
          resolve(false);
        } else {
          console.log(`Directory is not empty: ${dir}`);
          resolve(true);
        }
      }
    });
  });
}

module.exports = isDirectoryEmpty;

// Usage:
isDirectoryEmpty('src/assets/tmpDocs').then(isNotEmpty => console.log(isNotEmpty));