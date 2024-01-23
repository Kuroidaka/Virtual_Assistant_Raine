const common = require("./common")
const funcCall = require("./agent")
const chalk = require("chalk")
const language = require("../../assets/language.json")
const { detectLan } = require("../../utils")
module.exports = class askOpenAIUseCase {
    constructor (dependencies) {
      this.dependencies = dependencies
      this.promptMessageFunc = []
    }
    execute = async ({
      prompt,
      maxToken,
      curUser,
      conversation,
      prepareKey,
      haveFile,
      resource = "",
      stream = false,
      res = null,
      isTalking,
    }) => {
      try {
        // const { openAi, azureOpenAi } = this.dependencies

        //check language from request
        let currentLang = {lc: "en"}
        let model 
        let responseComplete = ""
        if(resource === "azure") { //use gpt3.5 for azure
          model = "gpt-3.5-turbo"
        }
        else { //user gpt4 for openai
          model = "gpt-4"
        }

        if(typeof prompt === 'string' || prompt instanceof String) {
          currentLang = language.languages[detectLan(prompt)]
        }
        else {
          const textFromPrompt = prompt.find(msg => typeof msg.text === 'string' || msg.text instanceof String).text
          currentLang = language.languages[detectLan(textFromPrompt)]
        }
       
        console.log(chalk.blue.bold(`prompt:(${JSON.stringify(currentLang)})`), prompt);
        
        if(haveFile.docs == "true" || haveFile.docs === true) { // must be here before prepare prompt and after detect language
          prompt =`Please consider to check the file user attached to answer the question below:\n\tQuestion:\n-----------\n${prompt}\n----------- `   
        }

        // prepare data system for conversation prompt
        const preparePrompt = common.prepareSystemPromptCommon(this.dependencies)
        const prepareData = {
          conversation: this.promptMessageFunc,
          redisConversation: conversation,
          userPrompt: prompt,
          curUser: curUser,
          isTalking : isTalking,
          lang: currentLang.lc,
          model: model,
          prepareKey: prepareKey,
        }
        const { 
          countSystem,
          conversation:preparedConversation
        } = await preparePrompt.execute(prepareData)
        this.promptMessageFunc = preparedConversation

        let temperature = 0.5
  

        if(haveFile.img == true || haveFile.img == "true") {// Read file image 
          console.log(chalk.blue.bold('ConversationPrompt for asking IMAGEs'), this.promptMessageFunc)
          const callGpt = common.handleCallGPTCommon(this.dependencies)
          const gptData = {
            model: resource === "azure" ? process.env.AZURE_OPENAI_API_GPT4_V : "gpt-4-vision-preview",
            conversation: this.promptMessageFunc,
            systemMsgCount: countSystem,
            temperature: temperature,
            prepareKey: prepareKey,
            functionCall: false,
            maxToken: maxToken,
            resource: resource,
            stream: stream,
            res: res
          }
          const { conversation:newCon, completion, error=null } = await callGpt.execute(gptData)
          this.promptMessageFunc = newCon

          // send the response data back to user

          if(error) {
            console.log(error)
            res.statusCode = 500;
            res.end()
            return 
          }
          console.log("Response:", completion.choices[0]);
          return ({ status: 200, data: completion.choices[0].message.content })
        }

        // get function calling definition
        const funcList = await funcCall({dependencies: this.dependencies})
        let isFuncCall = true

        // Log conversation
        console.log(chalk.blue.bold('ConversationPrompt'), this.promptMessageFunc)

        let responseData = {func:[]}

        while(true) {
          console.log(chalk.green.bold("------------------------ START REQUEST ------------------------"));
          // OPENAI asking
          const callGpt = common.handleCallGPTCommon(this.dependencies)
          const gptData = {
            model: resource === "azure" ? process.env.AZURE_OPENAI_API_GPT35 : model,
            conversation: this.promptMessageFunc,
            listFunc: funcList.listToolsSpec,
            systemMsgCount: countSystem,
            functionCall: isFuncCall,
            temperature: temperature,
            prepareKey: prepareKey,
            maxToken: maxToken,
            resource: resource,
            stream: stream,
            res: res
          }
          const { conversation:newConversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = newConversation
          // process function calling from tools
          const responseMessage = completion.choices[0].message
          const finishReason = completion.choices[0].finish_reason || completion.choices[0].finishReason
          if(finishReason){
  
            const toolCalls = responseMessage.function_call || responseMessage.functionCall
  
            // Log tools and arguments
            console.log(
              chalk.green.bold("Finish_reason"), finishReason
            )
            
            if(finishReason === "function_call") {
              // prepare arguments
              const toolName = toolCalls.name
              const toolToCall = funcList.tools[toolName];
              const toolArgs = JSON.parse(toolCalls.arguments)
              // Log tools and arguments
              console.log(
                chalk.green.bold("Tool name:"), toolName
              )
              Object.keys(toolArgs).forEach((key) => {
                if (typeof toolArgs[key] === 'object' || Array.isArray(toolArgs[key])) {
                  console.log(`---> ${key}:`, JSON.stringify(toolArgs[key]))
                }
                else { 
                  console.log(`---> ${key}: ${toolArgs[key]}`)
                }
              })
              
              const funcArgs = {
                args: toolArgs,
                conversation: this.promptMessageFunc,
                dependencies: this.dependencies,
                countSystem: countSystem,
                prepareKey: prepareKey,
                currentLang: currentLang,
                resource: resource
              }
              // push tools be triggered to response
              responseData.func.push(toolName)

              // trigger tools
              const toolResponse = await toolToCall.execute(funcArgs)

              if(toolResponse?.imgList) {
                responseData.image_list = toolResponse?.imgList
                responseComplete = completion
                break
              }

              this.promptMessageFunc.push({
                role: "assistant",
                content: `
                The content below is the result of calling function ${toolName} with arguments: ${JSON.stringify(toolArgs)}\n

                If the function is no longer called, just respond with the exact same {content} as follows (don't change anything):\n: 
                ---------------------------
                {content}: ${toolResponse.content}
                ---------------------------
                `,
              });


              // let { conversation:secondCon, completion } = await common.requestGptCommon(this.dependencies).execute({
              //   model: resource === "azure" ? process.env.AZURE_OPENAI_API_GPT35 : model,
              //   temperature: temperature,
              //   conversation: this.promptMessageFunc,
              //   maxToken: maxToken,
              //   functionCall: false,
              //   resource: resource
              // })
              // this.promptMessageFunc = secondCon

              // console.log(completion.choices[0])
              // return {
              //   status: 200,
              //   data: completion.choices[0].message.content,
              //   ...responseData
              // }
            
  
            }
            else {
              responseComplete = completion
              break
            }
          }  
          console.log(chalk.green.bold("------------------------ END REQUEST ------------------------"));
        }
        console.log("reason why stop", responseComplete.choices)
        responseData = {
          ...responseData,
          status: 200,
          data: responseComplete.choices[0].message.content 
        }
        return responseData


      } catch(error) {
        console.log(error)
        res.statusCode = 500;
        return res.end()
      }
  
    }
}
