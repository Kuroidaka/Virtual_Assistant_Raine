const { encoding_for_model } = require ("@dqbd/tiktoken");

//Returns the number of tokens in a text string
const numTokensFromString = (message) => {
  const encoder = encoding_for_model("gpt-3.5-turbo");

  const tokens = encoder.encode(message);
  encoder.free();
  return tokens.length;
}

module.exports = {
    numTokensFromString
}