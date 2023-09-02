const OpenAIApi = require('openai');    

const openai = new OpenAIApi({
    key: process.env.OPENAI_API_KEY,
});

module.exports = openai