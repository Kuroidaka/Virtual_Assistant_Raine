const { encoding_for_model } = require ("@dqbd/tiktoken");
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();

//Returns the number of tokens in a text string
const numTokensFromString = (message, model) => {
  const encoder = encoding_for_model(model);

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

  console.log(`The first matching language found: ${found ? found[0] : 'None'}`);
  console.log(found[0][0]+found[0][1]);

  return found[0][0]+found[0][1]
}

module.exports = {
    numTokensFromString,
    convertDates,
    detectLan
}