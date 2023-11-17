const { encoding_for_model } = require ("@dqbd/tiktoken");

//Returns the number of tokens in a text string
const numTokensFromString = (message, model) => {
  const encoder = encoding_for_model(model);

  const tokens = encoder.encode(message);
  encoder.free();
  return tokens.length;
}

module.exports = {
    numTokensFromString
}