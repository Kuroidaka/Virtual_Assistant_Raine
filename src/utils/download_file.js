const axios = require('axios');
const fs = require('fs');

async function downloadFile(url, destinationPath) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });

    response.data.pipe(fs.createWriteStream(destinationPath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => resolve());
      response.data.on('error', (error) => reject(error));
    });
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

module.exports = downloadFile

// // // Usage:
// const fileUrl = 'https://cdn.discordapp.com/attachments/1188353146662174791/1194693638517694594/so-lieu.docx?ex=65b14827&is=659ed327&hm=5e02e653b5fe1dcb970b2959d219f1d3a93f895c777a437556500f4b140cb720&';
// const destinationPath = 'src/assets/tmpDocs/file2.docx'; 

// downloadFile(fileUrl, destinationPath)
//   .then(() => {
//     console.log('File downloaded successfully!');
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });
