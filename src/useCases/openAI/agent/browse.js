const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { ChatOpenAI } =require("langchain/chat_models/openai");
const { Tool } = require("@langchain/core/tools");
const { DynamicTool } = require("langchain/tools");
const { OpenAIAgentTokenBufferMemory } = require( "langchain/agents/toolkits");
const { ConversationSummaryBufferMemory } = require("langchain/memory");

const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require( "langchain/memory");

  
const { serperCommon, scrapeCommon, sumCommon, callGPTCommon } = require("../common")
const dependencies = require("../../../config/dependencies")

const test = () => {

    const { openAi } = dependencies

    const funcSpec = {
        name: "web_browser",
        description: "The function for generating new image or editing the existing when having the prompt of the review of the image",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                model: {
                    type: "string",
                    description: "Base on the complexity prompt to choose the proper model, default model is 'dall-e-2' if user request a complexity image description or need a high quality image then use model 'dall-e-3' otherwise use 'dall-e-2'",
                    enum: ["dall-e-3", "dall-e-2"]
                },
                prompt: {
                    type: "string",
                    description: "The detailed image description, potentially modified to abide by the dalle policies. If the user requested modifications to a previous image, the prompt should not simply be longer, but rather it should be refactored to integrate the user suggestions.",
                },
                n: { 
                    type: "string", 
                    description: "The number of images to generate. If the user does not specify a number, generate 1 image. If the user specifies a number, generate that many images, up to a maximum of 5.",
                },
                size: { 
                    type: "string", 
                    description: "The size of the requested image. Use 1024x1024 (square) as the default, with model dall-e-3 use 1792x1024 if the user requests a wide image, and 1024x1792 for full-body portraits. Always include this parameter in the request."
                }
                
            },
        },
    }

    class ScrapeWebsiteInput extends DynamicTool {
        constructor(objective, url) {
            super();
            this.objective = objective;
            this.url = url;
        }
    }
    
    class ScrapeWebsiteTool extends DynamicTool {
        constructor() {
            super({
                name: "scrape_website",
                description: `useful when you need to get data from a website url, passing both url and objective to the function;
                - DO NOT make up any url, the url should only be the link to the website from the search tool results
                - objective is the targeted user want to know`,
                func: async (objective, url) => {
                    console.log("url:", url)
                    console.log("objective:", objective)
                    return scrapeCommon().execute({url, objective});
                }
            });
            // this.name = "scrape_website";
            this.argsSchema = ScrapeWebsiteInput;
        }
        
        _arun(url) {
            throw new Error("error here");
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

    const execute = async  (q, objective) => {

        const model = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });


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
              new DynamicTool({
                name: "scrape_website",
                description:
                  `Useful when you need to get data from a website url.
                   The input for this tool contain two arguments "url" and "objective"
                  - DO NOT make up any "url", the "url" should only be the link to the website from the search tool results
                  - "objective" is the targeted user want to know
                  and the the output will be a json string.
                  `,
                  func: async (objective, url) => {
                    console.log("url:", url)
                    console.log("objective:", objective)
                    return scrapeCommon().execute({url: objective});
                }
              }),

        ];

        const agentArgs = { 
            "systemMessage": systemPrompt,
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
            const result = await executor.invoke({ input: objective });

            console.log(`Got output ${result.output}`);

        } catch (error) {
            console.log(error)
            return error
            
        }
    }

    return { execute, funcSpec }
}

test().execute("homestay Đà Lạt 2023", "môn SE108 của trường UIT HCM là học về cái gì vậy?")