const chalk = require("chalk");

const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { ChatOpenAI } =require("langchain/chat_models/openai");
const { DynamicTool } = require("langchain/tools");
const { OpenAIAgentTokenBufferMemory } = require( "langchain/agents/toolkits");
const { ConversationSummaryBufferMemory } = require("langchain/memory");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require( "langchain/memory");

// const { RedisChatMessageHistory } = require("@langchain/community/stores/message/ioredis");


const language = require("../../assets/language.json")
const { detectLan } = require("../../utils")

const RainePrompt = require("../../assets/Raine_prompt_system.js")
const scrape = require("./agent/browse/scrape")
const serper = require("./agent/browse/serp")
const dbChat = require("./agent/db_chat")



class askOpenAIUseCase {
    constructor (dependencies) {
      this.dependencies = dependencies
      this.promptMessageFunc = []
    }
    execute = async ({
      prompt,
    }) => {
      try {
        
        let currentLang = { 
            "lt": "en-US", 
            "cc": "us",
            "lc": "en"
        }
        let llm

        currentLang = language.languages[detectLan(prompt)]

        llm = new ChatOpenAI({
          modelName: "gpt-3.5-turbo-0125",
          openAIApiKey: "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"
        });
    
        // get system prompt for browse agent
        const instructions = RainePrompt({lang: currentLang.lc})
        const systemPrompt = instructions.prefix

        // DEFINE TOOLS
        const args = {// Tool arg
            currentLang: currentLang,
        }

        const scrapeTool = scrape(args).ScrapeWebsiteTool
        const searchTool = serper(args).GoogleSearchTool
        const dbChatTool = dbChat(args).dataBaseInteractTool

        const tools = [
            new searchTool(),
            new scrapeTool(),
            new dbChatTool()
        ];


        // MEMORY
        const memory = new OpenAIAgentTokenBufferMemory({
            llm: llm,
            memoryKey: "chat_history",
            outputKey: "output",
            maxTokenLimit: 8000,
            returnMessages: true,
          });
        
        const agentArgs = { 
          prefix: systemPrompt
        }

        const executor = await initializeAgentExecutorWithOptions(tools, llm, {
            agentType: "openai-functions",
            verbose: true,
            returnIntermediateSteps: true,
            maxIterations: 3,
            agentArgs: agentArgs,
            memory: memory,
        });

        const result = await executor.invoke({ 
          input: prompt          
        });

        console.log(chalk.green(result.output));
        console.log("===============\n", memory)

        // let responseData 
        // responseData = {
        //   ...responseData,
        //   status: 200,
        //   data: responseComplete.choices[0].message.content 
        // }
        // return responseData


      } catch(error) {
        console.log(error)

        // res.statusCode = 500;
        // return res.end()
      }
  
    }
}

const test = new askOpenAIUseCase()

let args = process.argv.slice(2).join(" ")

test.execute({prompt: args})
