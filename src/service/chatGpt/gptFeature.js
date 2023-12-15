const chalk = require("chalk");
const { numTokensFromString } = require("../../utils/index");
const openai = require("../../src/config/openAI")
const RainePrompt = require("../../Raine_prompt_system.json")
const redisService = require("../redis/redis.service");

const gpt = {
    callGPT: async (model, temperature, conversation, maxTokenEachScript, countSystem, prepareKey, lan = "default", functionCall = false, listFunc = () => {}) => {
      let flagCheckOverToken = false
      let modelCountToken
      if(model === "gpt-4-vision-preview") {
        modelCountToken = "gpt-4"
      }
      else {
        modelCountToken = model
      }
      const { newFlag, conversation:newConversation } = await gpt.countToken(flagCheckOverToken, conversation, countSystem, modelCountToken)
      conversation = newConversation
      if(newFlag) {
        await redisService.mergeNewConversation(prepareKey, lan, conversation)
      }

      let completion

      if(functionCall) {
        // Ask OpenAI function
        completion = await openai.chat.completions.create({
          model: model,
          messages: conversation,
          // model: "gpt-3.5-turbo",
          temperature: temperature,
          max_tokens: maxTokenEachScript, 
          functions: listFunc,
          function_call: "auto"
        });
      }
      else {
        // Ask OpenAI
        completion = await openai.chat.completions.create({
          model: model,
          messages: conversation,
          temperature: 1,
          max_tokens: maxTokenEachScript,
        });
      }

      conversation.push(completion.choices[0].message)
      return {
          conversation,
          completion
      }
    },
    prepare_system_prompt: async (conversation, oldConversation, userPrompt, curUser, loyal, lang, isTalk = false) => {
      let countSystem = 0
      let loyalSystem = { role: "system", content: RainePrompt[lang].loyal }
      let systemTTS =  { role: "system", content: RainePrompt[lang].system_tts }
      let taskRemind =  { role: "system", content: RainePrompt[lang].task }

      const date = new Date()
      const currentDate = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();

      if(lang && RainePrompt[lang]) {
        conversation[0] = { role: "system", content: `
        Current date: ${currentDate}
        ${RainePrompt[lang].system}` }
        ++countSystem
      }

      conversation.push(taskRemind)
      countSystem ++
      
      // check user boss on Discord
      if(curUser) {
        const userResponse = { 
          role: "system", content: `You know who you are talking to, and this is the person's name talking to you: ${curUser}`
        }
        conversation.push(userResponse)
        countSystem += 3
      }
      
      if(loyal) {
        conversation.push(loyalSystem)
        ++countSystem
      }

      if(isTalk) {
        conversation.push(systemTTS)
        ++countSystem
      }

      // prepare data for conversation
      const newMsg = { role: "user", content: userPrompt }
      if(oldConversation && oldConversation.length > 0) {
        conversation = [...conversation, ...oldConversation]
      }
      conversation.push(newMsg)

      return {
        countSystem,
        conversation
      }
    },
    countToken: async (flagCheckOverToken, conversation, countSystem, model) => {
      // check token length

      let condition = true
      let numTokens = numTokensFromString(JSON.stringify(conversation), model)
      let numTokensBefore = numTokens

      while(condition) { 
        const numTokens = numTokensFromString(JSON.stringify(conversation), model)
        console.log(chalk.yellow.bold("Token: "), numTokens)
        if(numTokens >= 6000) {
          flagCheckOverToken = true
          conversation.splice(countSystem, 2);
        }
        else 
          condition = false
      }
      numTokens = numTokensFromString(JSON.stringify(conversation), model)

      console.log(chalk.blue.bold("ConversationPrompt"), conversation);
      if(flagCheckOverToken) {
        console.log(chalk.yellow.bold("Token before: "), numTokensBefore)
        console.log(chalk.yellow.bold("Token after: "), numTokens)
      }

      return { 
        newFlag: flagCheckOverToken,
        conversation
      }
    }
}

module.exports = gpt