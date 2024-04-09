const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { DirectoryLoader } = require('langchain/document_loaders/fs/directory');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf')
const { DocxLoader } = require("langchain/document_loaders/fs/docx")
const { PPTXLoader } = require("langchain/document_loaders/fs/pptx")

const { FaissStore } =require("langchain/vectorstores/faiss")
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

const loadFileIntoVector = async ({docsPath, resource}) => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(docsPath, {
        '.pdf': (path) => new PDFLoader(path),
        '.docx': (path) => new DocxLoader(path),  
        '.pptx': (path) => new PPTXLoader(path),  
    });
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    // Defind LLM
    let llm
    if(resource === "azure") {
      llm = new OpenAIEmbeddings({ 
          temperature: 0,
          azureOpenAIApiKey: process.env.AZURE_OPENAI_API,
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
          azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
          azureOpenAIApiDeploymentName: "ADA",
          // azureOpenAIBasePath: process.env.AZURE_OPENAI_API_URL,
      })
    }
    else {
        llm = new OpenAIEmbeddings();
    }

    let vectorStore = await FaissStore.fromDocuments(docs, llm)

    const directory = "src/assets/vector";
    await vectorStore.save(directory);

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

module.exports = loadFileIntoVector