const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { ChatOpenAI } =require("langchain/chat_models/openai");
const { Tool } = require("@langchain/core/tools");
const { DynamicTool } = require("langchain/tools");
const { OpenAIAgentTokenBufferMemory } = require( "langchain/agents/toolkits");
const { ConversationSummaryBufferMemory } = require("langchain/memory");

const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require( "langchain/memory");
const { DynamicStructuredTool } = require("langchain/tools");
const { z } = require("zod")
  
const { serperCommon, scrapeCommon, sumCommon, callGPTCommon } = require("../common")
const dependencies = require("../../../config/dependencies")

module.exports = () => {

    const funcSpec = {
        name: "browse",
        description: "The function getting the realtime events, data, news, ... from the internet.",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                q: {
                    type: "string",
                    description: "The question that user want to know about the current events, data, news, ...",
                }
            },
        },
    }

    const execute = async  ({args, conversation}) => {

        const { q } = args
        const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo-16k-0613", temperature: 0 });

        // Define scrapeWebsite Schema
        const scrapeWebsiteSchema = z.object({
            url: z.string(),
            objective: z.string(),
        });
        
        // Define tool
        class ScrapeWebsiteTool extends DynamicStructuredTool {
            constructor() {
            super({
                name: "scrape_website",
                description: `Useful when you need to get data from a website url. The input for this tool contain 2 argument (url, objective) - The "objective" is the targeted questions you want to know - DO NOT make up any "url", the "url" should only be the link to the website from the search tool results. The the output will be a json string.`,
                func: async ({url, objective}) => {
                console.log("url:", url)
                console.log("objective:", objective)
                return scrapeCommon().execute({url, objective});
                },
                schema: scrapeWebsiteSchema,
            });
            }
        }

        const systemPrompt = `
        You are a world class researcher, who can do detailed research on any topic and produce facts based results; 
        you do not make things up, you will try as hard as possible to gather facts & data to back up the research. 

        Please make sure you complete the objective above with the following rules:
        1/ You should do enough research to gather as much information as possible about the objective
        2/ If there are url of relevant links & articles, you will scrape it to gather more information
        3/ After scraping & search, you should think "is there any new things i should search & scraping based on the data I collected to increase research quality?" If answer is yes, continue; But don't do this more than 3 iteratins
        4/ You should not make things up, you should only write facts & data that you have gathered
        5/ In the final output, You should include all reference data & links to back up your research; You should include all reference data & links to back up your research
        6/ In the final output, You should include all reference data & links to back up your research; You should include all reference data & links to back up your research
        `

        const tools = [
            new DynamicTool({
                name: "search",
                description:
                  `useful when you need to answer the questions about current events, data, you should ask targeted questions,
                  The input for this tool is the values of "q" in that order and the the output will be a json string.`,
                func: async (q) => {
                    return await serperCommon().execute({q})
                }
              }),
              new ScrapeWebsiteTool()
        ];

        const agentArgs = { 
            "prefix": systemPrompt,
            "extraPromptMessage": new MessagesPlaceholder("chat_history")
        }

        // const memory = new ConversationSummaryBufferMemory({
        //     memoryKey: "chat_history",
        //     llm: model,
        //     maxTokenLimit: 1000,
        //     returnMessages: true,
        //   });

        const memory = new OpenAIAgentTokenBufferMemory({
            llm: model,
            memoryKey: "chat_history",
            outputKey: "output",
            maxTokenLimit: 1000,
            returnMessages: true,
          });

        // const customMemory = new BufferMemory({
        //     chatHistory: new ChatMessageHistory(history),
        //     memoryKey: 'chat_history',
        //     returnMessages: true,
        //   });
          

        const executor = await initializeAgentExecutorWithOptions(tools, model, {
            agentType: "openai-functions",
            verbose: true,
            returnIntermediateSteps: true,
            agentArgs: agentArgs,
            memory: memory
        });

        try {
            const result = await executor.invoke({ input: q });

            console.log(`Got output ${result.output}`);
            conversation.push({
                role: "assistant",
                content: result.output
            })

              return {
                content: result.output,
                conversation 
              }

        } catch (error) {
            console.log(error)
            return error
            
        }
    }

    return { execute, funcSpec }
}

// test().execute({args:{q: " nhận xét về lượng khách du lịch đà lạt mùa đông năm 2023"}})

