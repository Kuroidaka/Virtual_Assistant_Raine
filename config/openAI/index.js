const OpenAIApi = require('openai');    

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai