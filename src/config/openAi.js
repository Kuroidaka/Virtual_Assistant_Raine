const OpenAIApi = require('openai');    

const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openAi