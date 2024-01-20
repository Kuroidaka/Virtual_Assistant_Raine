const { Document } = require("langchain/document")
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter")
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts")
const { loadSummarizationChain } = require("langchain/chains")

module.exports = ({currentLang, resource}) => {

  if(!currentLang) {
    currentLang = { 
        "lt": "en-US", 
        "cc": "us",
        "lc": "en"
    }
  }
  const execute = async (text, objective) => {
    let model
    if(resource === "azure") {
      model = new OpenAI({ 
          temperature: 0,
          azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
          azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
          azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_GPT35,
          // azureOpenAIBasePath: process.env.AZURE_OPENAI_API_URL,

      })
    }
    else {
        model = new OpenAI({ modelName: "gpt-3.5-turbo-16k-0613", temperature: 0 });
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 500,
      separators: ["\n\n", "\n"]
    });

    const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: text }),
      ]);

    const promptTemplate = `
    Write a summary of the following text for {objective} in this language {currentLang}: 
    --------
    {text}
    --------

    SUMMARY:
    `

    const map_prompt_template = new PromptTemplate({
        inputVariables: ["objective", "text", "currentLang"],
        template: promptTemplate,
    });
    
    const summarizeChain = loadSummarizationChain(model, {
        type: "map_reduce",
        verbose: true,
        map_prompt: map_prompt_template,
        combine_prompt: map_prompt_template,
      });
      
    const summary = await summarizeChain.call({
        input_documents: docOutput, 
        objective: objective,
        currentLang: currentLang
    });
      
    return summary
  }

  return { execute }
}