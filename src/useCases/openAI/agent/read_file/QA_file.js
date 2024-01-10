const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
// import { PineconeStore } from 'langchain/vectorstores/pinecone';
// import { pinecone } from '@/utils/pinecone-client';
const { DirectoryLoader } = require('langchain/document_loaders/fs/directory');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf')
const { DocxLoader } = require("langchain/document_loaders/fs/docx")
const { PPTXLoader } = require("langchain/document_loaders/fs/pptx")

const { FaissStore } =require("langchain/vectorstores/faiss")
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

const { OpenAI } = require("langchain/llms/openai")
const { loadQAMapReduceChain, RetrievalQAChain, loadQAStuffChain } = require("langchain/chains")
const { PromptTemplate } = require("@langchain/core/prompts")


const run = () => {
  const execute = async ({args, conversation, currentLang, resource}) => {

    const { q } = args;
    try {
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

      // const promptTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

      // {context}

      // Question: {question}
      // Answer in en:`;
      // const prompt = PromptTemplate.fromTemplate(promptTemplate);
      
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
        llm = new OpenAI({...azureConfig, azureOpenAIApiDeploymentName: "GPT35TURBO16K"})
        embeddingsLlm = new OpenAIEmbeddings({...azureConfig, azureOpenAIApiDeploymentName: "ADA"})
      }
      else {
        llm = new OpenAI({ modelName: "gpt-3.5-turbo-16k-0613", temperature: 0 });
        embeddingsLlm = new OpenAIEmbeddings()
      }

      const loadedVectorStore = await FaissStore.load(
        directory,
        embeddingsLlm
      );
  
      const chain = new RetrievalQAChain({
        // combineDocumentsChain: loadQAStuffChain(llm, { prompt }),
        combineDocumentsChain: loadQAMapReduceChain(llm, { verbose : false } ),
        retriever: loadedVectorStore.asRetriever(),
      });

      // const chain = RetrievalQAChain.fromLLM(llm, loadedVectorStore.asRetriever(), {
      //   returnSourceDocuments: true, // Can also be passed into the constructor
      // });
      

      const res = await chain.call({
        query: q,
      });
      console.log(JSON.stringify(res, null, 2));

      // console.log({ res });
  
    } catch (error) {
      console.log('error', error);
      throw new Error('Failed to ingest your data');
    }
  };

  return { execute }
}

(async () => {
    const q = "Độ tuổi khảo sát nào chiếm % cao nhất";
    const args = { q };
    await run().execute({args});
    console.log('ingestion complete');
})();