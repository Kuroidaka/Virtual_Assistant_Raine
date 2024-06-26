const { encoding_for_model } = require ("@dqbd/tiktoken");
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
const downloadFile = require('./download_file')
const deleteFilesInDirectory = require('./delete_file_dir')
const deleteFile = require('./del_spec_file')
const isDirectoryEmpty = require('./is_dir_empty')
const getFileExtension = require('./getFileExtension')
const fileDirToUrl = require('./dirFile_into_discordUrl')

//Returns the number of tokens in a text string
const countToken = (message, model) => {
  let checkModel
  if(model.includes("4o")) checkModel = "gpt-4"
  const encoder = encoding_for_model(checkModel);

  const tokens = encoder.encode(message);
  encoder.free();
  return tokens.length;
}

const convertDates = (dateStr) => {
    let date = new Date(dateStr);
    return date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();
}


const detectLan = (lang) => {
  const data = lngDetector.detect(lang)
  let languages = ["english", "vietnamese", "japanese"];

  let found = data.find(([language]) => languages.includes(language));

  if(!found) return "en"
  // console.log(`The first matching language found: ${found ? found[0] : 'None'}`);
  // console.log(found[0][0]+found[0][1]);

  return found[0][0]+found[0][1]
}

module.exports = {
    countToken,
    convertDates,
    detectLan,
    deleteFilesInDirectory,
    deleteFile,
    downloadFile,
    isDirectoryEmpty,
    getFileExtension,
    fileDirToUrl
}