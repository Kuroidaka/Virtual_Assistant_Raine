const OpenAIApi = require('openai');    
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

const azureOpenAi = new OpenAIClient(
    process.env.AZURE_OPENAI_API_URL, 
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);


module.exports = { openAi, azureOpenAi }