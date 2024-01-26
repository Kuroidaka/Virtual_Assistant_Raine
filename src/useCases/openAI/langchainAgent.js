// const chalk = require("chalk")
// const { AgentExecutor, createOpenAIToolsAgent } = require("langchain/agents");
// const { pull } = require("langchain/hub");
// const { ChatOpenAI } = require("@langchain/openai");

// const common = require("./common")
// const funcCall = require("./agent")
// const language = require("../../assets/language.json")
// const { detectLan } = require("../../utils")
// const scrape = require("./agent/browse/scrape.js")
// const serper = require("./agent/browse/serp.js")

// class askLangChainUseCase {
//     constructor (dependencies) {
//       this.dependencies = dependencies
//       this.promptMessageFunc = []
//     }
//     execute = async ({
//         prompt,
//         resource = "azure"
//     }) => {
//       try {
//         // const { openAi, azureOpenAi } = this.dependencies

//         // check language from request
//         let currentLang = {lc: "en"}
//         let model = ""
//         // if(resource === "azure") { //use gpt3.5 for azure
//         //   model = "gpt-3.5-turbo"
//         // }
//         // else { //user gpt4 for openai
//         //   model = "gpt-4"
//         // }

//         // if(typeof prompt === 'string' || prompt instanceof String) {
//         //   currentLang = language.languages[detectLan(prompt)]
//         // }
//         // else {
//         //   const textFromPrompt = prompt.find(msg => typeof msg.text === 'string' || msg.text instanceof String).text
//         //   currentLang = language.languages[detectLan(textFromPrompt)]
//         // }
       
//         // console.log(chalk.blue.bold(`prompt:(${JSON.stringify(currentLang)})`), prompt);
       
//         // ++++++++++++++ Langchain begin ++++++++++++++
//         // const prompt = await pull("hwchase17/openai-tools-agent");

//         const scrapeTool = scrape({currentLang, resource}).ScrapeWebsiteTool
//         const searchTool = serper({currentLang}).GoogleSearchTool
//         const tools = [
//             new searchTool(),
//             new scrapeTool()
//         ];

//         const llm = new ChatOpenAI({
//             modelName: "gpt-3.5-turbo-1106",
//             temperature: 0,
//         });

//         const agent = await createOpenAIToolsAgent({
//             llm,
//             tools,
//             prompt,
//         });

//         const agentExecutor = new AgentExecutor({
//             agent,
//             tools,
//           });
          
//           const result = await agentExecutor.invoke({
//             input: "what is LangChain?",
//             chat_history: [
//                 new HumanMessage("hi! my name is cob"),
//                 new AIMessage("Hello Cob! How can I assist you today?"),
//             ],
//           });
          
//           console.log(result);


//       } catch(error) {
//         console.log(error)
//         return error
//       }
  
//     }
// }

// // Usage:

// const langchain = new askLangChainUseCase()
// const prompt = "what is LangChain?"

// langchain.execute({})
