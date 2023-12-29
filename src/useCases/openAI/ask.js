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
      haveFile
    }) => {
      try {
        //check language from request
        let currentLang = "en"
        if(typeof prompt === 'string' || prompt instanceof String) {
          currentLang = language.languages[detectLan(prompt)]
        }
        else {
          const textFromPrompt = prompt.find(msg => typeof msg.text === 'string' || msg.text instanceof String).text
          currentLang = language.languages[detectLan(textFromPrompt)]
        }
       
        console.log(chalk.blue.bold(`prompt:(${currentLang})`), prompt);
        
        // prepare data system for conversation prompt
        const preparePrompt = common.prepareSystemPromptCommon(this.dependencies)
        const prepareData = {
          conversation: this.promptMessageFunc,
          redisConversation: conversation,
          userPrompt: prompt,
          curUser: curUser,
          isTalk : false,
          lang: currentLang,
          model: "gpt-4",
          prepareKey: prepareKey,
        }
        const { 
          countSystem,
          conversation:preparedConversation
        } = await preparePrompt.execute(prepareData)
        this.promptMessageFunc = preparedConversation

        let temperature = 0.5
  
        if(haveFile) {// Read file image
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
        const funcList = await funcCall()
        let model = "gpt-4"
        let isFuncCall = true

        // Log conversation
        console.log(chalk.blue.bold('ConversationPrompt'), this.promptMessageFunc)

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
            listFunc: funcList.listFuncSpec
          }
          const { conversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = conversation
          // process function calling from tools
          const responseMessage = completion.choices[0].message
          if(completion.choices[0].finish_reason){
            console.log(chalk.green.bold("Finish_reason"), completion.choices[0].finish_reason )
            
            if(completion.choices[0].finish_reason !== "stop"){
              // prepare arguments
              const args = JSON.parse(responseMessage.function_call.arguments)
              Object.keys(args).forEach(key => {
                console.log(`---> ${key}: ${args[key]}`)
              })

              const funcArgs = {
                args: args,
                conversation: this.promptMessageFunc,
                dependencies: this.dependencies,
                countSystem: countSystem,
                prepareKey: prepareKey,
                currentLang: currentLang
              }

              if(responseMessage.function_call?.name === "get_current_weather") {
                this.promptMessageFunc = await funcList.func.weatherFunc.execute(funcArgs)
              } 
              else if(responseMessage.function_call?.name === "create_reminder") {
                this.promptMessageFunc = await funcList.func.reminderFunc.execute(funcArgs)
              } 
              else if(responseMessage.function_call?.name === "browse") {
                const { content, conversation } = await funcList.func.browseFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content })
              } 
              else if(responseMessage.function_call?.name === "follow_up_image_in_chat") {
                const { content, conversation } = await funcList.func.followUpImageFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content })
              }
              else if(responseMessage.function_call?.name === "generate_image") {
                const { conversation, content, imgList } = await funcList.func.generateImageFunc.execute(funcArgs)
                this.promptMessageFunc = conversation
                return ({ status: 200, data: content, image_list: imgList })
              }
            }
            else {
              return ({ status: 200, data: completion.choices[0].message.content })
            }
          }  
          console.log(chalk.green.bold("------------------------ END REQUEST ------------------------"));
        }  
      } catch(error) {
        return ({status: 500, error: `at File: ${__filename}\n\t${error}`})
      }
  
    }
}
