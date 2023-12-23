const { Document } = require("langchain/document")
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter")
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts")
const { loadSummarizationChain } = require("langchain/chains")

module.exports = () => {
  const execute = async (text, objective) => {

    const model = new OpenAI({ temperature: 0 });
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 500,
      separators: ["\n\n", "\n"]
    });

    const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: text }),
      ]);

    const promptTemplate = `
    Write a summary of the following text for {objective}: 
    --------
    {text}
    --------

    SUMMARY:
    `

    const map_prompt_template = new PromptTemplate({
        inputVariables: ["objective", "text"],
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
        objective: objective
    });
      
    return summary
  }

  return { execute }
}