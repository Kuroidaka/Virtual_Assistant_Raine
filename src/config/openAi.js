const OpenAIApi = require('openai');    
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

let azureOpenAi
if(process.env.AZURE_OPENAI_API_KEY) {
    console.log("Azure Openai")
    azureOpenAi = new OpenAIClient(
        process.env.AZURE_OPENAI_API_URL, 
        new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
    );
}
else {
    console.log("Openai")
}



module.exports = { openAi, azureOpenAi }