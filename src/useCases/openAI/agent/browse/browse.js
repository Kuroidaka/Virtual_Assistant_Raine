const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { ChatOpenAI } =require("langchain/chat_models/openai");
const { DynamicTool } = require("langchain/tools");
const { OpenAIAgentTokenBufferMemory } = require( "langchain/agents/toolkits");
const { ConversationSummaryBufferMemory } = require("langchain/memory");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require( "langchain/memory");

const RainePrompt = require("../../../../assets/Raine_prompt_system.js")
const scrape = require("./scrape")
const serper = require("./serp")

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

    const execute = async  ({args, conversation, currentLang}) => {

        const { q } = args
        const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo-16k-0613", temperature: 0 });

        // get system prompt for browse agent
        const instructions = RainePrompt({currentLang})
        const systemPrompt = instructions.tools.browse.instructions

        // defind tool
        const scrapeTool = scrape({currentLang}).ScrapeWebsiteTool
        const searchTool = serper({currentLang}).GoogleSearchTool
        const tools = [
            new searchTool(),
            new scrapeTool()
        ];

        const agentArgs = { 
            "prefix": systemPrompt,
            "extraPromptMessage": new MessagesPlaceholder("chat_history")
        }


        const memory = new OpenAIAgentTokenBufferMemory({
            llm: model,
            memoryKey: "chat_history",
            outputKey: "output",
            maxTokenLimit: 1000,
            returnMessages: true,
          });

        const executor = await initializeAgentExecutorWithOptions(tools, model, {
            agentType: "openai-functions",
            verbose: true,
            returnIntermediateSteps: true,
            agentArgs: agentArgs,
            memory: memory
        });

        try {
            const result = await executor.invoke({ input: `${q} in language ${currentLang.lc}` });

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
