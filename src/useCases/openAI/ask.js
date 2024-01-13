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
      isTalk = false,
      haveFile,
      resource = ""
    }) => {
      try {
        //check language from request
        let currentLang = {lc: "en"}
        if(typeof prompt === 'string' || prompt instanceof String) {
          currentLang = language.languages[detectLan(prompt)]
        }
        else {
          const textFromPrompt = prompt.find(msg => typeof msg.text === 'string' || msg.text instanceof String).text
          currentLang = language.languages[detectLan(textFromPrompt)]
        }
       
        console.log(chalk.blue.bold(`prompt:(${JSON.stringify(currentLang)})`), prompt);
        
        if(haveFile.docs) { // must be here before prepare prompt and after detect language
          prompt =`Please consider to check the file user attached to answer the question below:\n\tQuestion:\n-----------\n${prompt}\n----------- `   
        }

        // prepare data system for conversation prompt
        const preparePrompt = common.prepareSystemPromptCommon(this.dependencies)
        const prepareData = {
          conversation: this.promptMessageFunc,
          redisConversation: conversation,
          userPrompt: prompt,
          curUser: curUser,
          isTalk : false,
          lang: currentLang.lc,
          model: "gpt-4",
          prepareKey: prepareKey,
        }
        const { 
          countSystem,
          conversation:preparedConversation
        } = await preparePrompt.execute(prepareData)
        this.promptMessageFunc = preparedConversation

        let temperature = 0.5
  

        if(haveFile.img) {// Read file image 
          const callGpt = common.callGPTCommon(this.dependencies)
          const gptData = {
            model: "gpt-4-vision-preview",
            temperature: temperature,
            conversation: this.promptMessageFunc,
            maxToken: maxToken,
            systemMsgCount: countSystem,
            prepareKey: prepareKey,
            functionCall: false
          }
          const { conversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = conversation

          // send the response data back to user
          console.log("Response:", completion.choices[0]);
          return ({ status: 200, data: completion.choices[0].message.content })
        }

        // get function calling definition
        const funcList = await funcCall({dependencies: this.dependencies})
        let model = "gpt-4"
        let isFuncCall = true

        // Log conversation
        console.log(chalk.blue.bold('ConversationPrompt'), this.promptMessageFunc)

        let responseData = {func:[]}
        while(true) {
          
          console.log(chalk.green.bold("------------------------ REQUEST ------------------------"));
          // OPENAI asking
          const callGpt = common.callGPTCommon(this.dependencies)
          const gptData = {
            model: model,
            temperature: temperature,
            conversation: this.promptMessageFunc,
            maxToken: maxToken,
            systemMsgCount: countSystem,
            prepareKey: prepareKey,
            functionCall: isFuncCall,
            listFunc: funcList.listFuncSpec,
            resource: resource
          }
          const { conversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = conversation
          // process function calling from tools
          const responseMessage = completion.choices[0].message
          const finishReason = completion.choices[0].finish_reason || completion.choices[0].finishReason
          if(finishReason){

            console.log(
              chalk.green.bold("Finish_reason"), finishReason
            )
            
            if(finishReason !== "stop") {
              // prepare arguments
              const functionCall = responseMessage.function_call || responseMessage.functionCall

              // Log arguments
              const args = JSON.parse(functionCall.arguments)
              Object.keys(args).forEach(key => {
                if (typeof args[key] === 'object' || Array.isArray(args[key])) {
                  console.log(`---> ${key}:`, JSON.stringify(args[key]))
                }
                else { 
                  console.log(`---> ${key}: ${args[key]}`)
                }
              })

              const funcArgs = {
                args: args,
                conversation: this.promptMessageFunc,
                dependencies: this.dependencies,
                countSystem: countSystem,
                prepareKey: prepareKey,
                currentLang: currentLang,
                resource: resource
              }
              responseData.func.push(functionCall.name)
              if(functionCall?.name === "get_current_weather") {
                this.promptMessageFunc = await funcList.func.weatherFunc.execute(funcArgs)
              } 
              else if(functionCall?.name === "create_reminder") {
                this.promptMessageFunc = await funcList.func.reminderFunc.execute(funcArgs)
              } 
              else if(functionCall?.name === "browse") {
                const { content, conversation } = await funcList.func.browseFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content })
              } 
              else if(functionCall?.name === "ask_about_document") {
                const { content, conversation } = await funcList.func.askAboutDocsFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content })
              } 
              else if(functionCall?.name === "follow_up_image_in_chat") {
                const { content, conversation } = await funcList.func.followUpImageFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content })
              }
              else if(functionCall?.name === "generate_image") {
                const { conversation, content, imgList } = await funcList.func.generateImageFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content, image_list: imgList })
              }
            }
            else {
              responseData = {
                ...responseData,
                status: 200,
                data: completion.choices[0].message.content 
              }
              return responseData
            }
          }  
          console.log(chalk.green.bold("------------------------ END REQUEST ------------------------"));
        }  
      } catch(error) {
        return ({status: 500, error: `at File: ${__filename}\n\t${error}`})
      }
  
    }
}
