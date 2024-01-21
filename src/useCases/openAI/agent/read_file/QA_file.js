const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
// import { PineconeStore } from 'langchain/vectorstores/pinecone';
// import { pinecone } from '@/utils/pinecone-client';

const { FaissStore } =require("langchain/vectorstores/faiss")
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

const { OpenAI } = require("langchain/llms/openai")
const { ChatOpenAI } =require("langchain/chat_models/openai");
const { loadQAMapReduceChain, RetrievalQAChain, loadQAStuffChain } = require("langchain/chains")
const { PromptTemplate } = require("@langchain/core/prompts")


module.exports = () => {
  const execute = async ({args, currentLang, resource}) => {
    const { q } = args;
    try {
      let contentReturn = ""
      const directory = "src/assets/vector";
    
      // console.log('creating vector store...');
      // const embeddings = new OpenAIEmbeddings();
      // const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
  
      // //embed the PDF documents
      // await PineconeStore.fromDocuments(docs, embeddings, {
      //   pineconeIndex: index,
      //   namespace: PINECONE_NAME_SPACE,
      //   textKey: 'text',
      // });

      // const promptTemplateContent = `
      // Using language {language} to answer the following question using the document content:
      // --------
      // {question}
      // --------
      // `;
      // const prompt = PromptTemplate.fromTemplate(promptTemplateContent);
      // const prompt = promptTemplate.format({question: q, language: currentLang});
      
// config llm
      let llm
      let embeddingsLlm 
      if(resource === "azure") {

        const azureConfig = { 
          temperature: 0,
          azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
          azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
          // azureOpenAIBasePath: process.env.AZURE_OPENAI_API_URL,
      }
        llm = new ChatOpenAI({ 
          ...azureConfig,
          azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_GPT35,
        })
        embeddingsLlm = new OpenAIEmbeddings({...azureConfig, azureOpenAIApiDeploymentName: "ADA"})
      }
      else {
        llm = new ChatOpenAI({
          modelName: "gpt-3.5-turbo-16k-0613",
          temperature: 0
        });
        embeddingsLlm = new OpenAIEmbeddings()
      }
// load vector store
      const loadedVectorStore = await FaissStore.load(
        directory,
        embeddingsLlm
      );
 
// load chain
      const chain = new RetrievalQAChain({
        // combineDocumentsChain: loadQAStuffChain(llm, { prompt }),
        combineDocumentsChain: loadQAMapReduceChain(llm, { verbose : true } ),
        retriever: loadedVectorStore.asRetriever(),
      });

      // const chain = RetrievalQAChain.fromLLM(
      //   llm, 
      //   loadedVectorStore.asRetriever(),
      //   {
      //     prompt : prompt,
      //     verbose: true
      //     // returnSourceDocuments: true, // Can also be passed into the constructor
      //   }
      // );
      

      const res = await chain.call({
        query: q,
        language: currentLang.lc,
      });
      console.log(JSON.stringify(res, null, 2));
      
      contentReturn = `Based on the following document search results to answer user: 
      result: ${res.text}`
      
      return {
        content: contentReturn,
      }
  
    } catch (error) {
      console.log('error', error);
      return {
        content: `Error: ${error}`
      }
    }
  };
  
  const funcSpec = {
    type: "function",
    function: {  
      name: "ask_about_document",
      description: "The function to ask about a document and provide information based on the user's prompt.",
      parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
              q: {
                  type: "string",
                  description: "The question that the user wants to know about the uploaded document",
              }
          },
          required: ["q"],
      }
    }

  }
  
  return { execute, funcSpec }
}

// // Usage:
// (async () => {
//     const q = "Độ tuổi khảo sát nào chiếm % cao nhất";
//     const args = { q };
//     await run().execute({args, resource:"azure", currentLang: "en"});
//     console.log('ingestion complete');
// })();