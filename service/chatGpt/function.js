const chalk = require("chalk");
const { log } = require("../../config/log/log.config");
const { numTokensFromString } = require("../../utils/index");
const openai = require("../../config/openAI")

const gpt = {
    callGPT: async (model, conversation, maxTokenEachScript, countSystem, functionCall = false, listFunc = () => {}) => {
      let flagCheckOverToken = false

      const { newFlag, conversation:newConversation } = await gpt.countToken(flagCheckOverToken, conversation, countSystem, model)
      conversation = newConversation
      if(newFlag) {
        let lan = ""
        await redisService.mergeNewConversation(guildID, lan, conversation)
      }

      let completion

      if(functionCall) {
        // Ask OpenAI function
        completion = await openai.chat.completions.create({
          model: model,
          messages: conversation,
          // model: "gpt-3.5-turbo",
          temperature: 1,
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
          // model: "gpt-3.5-turbo",
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
    prepare_system_prompt: async (conversation, oldConversation, userPrompt, curUser, loyal,) => {
      let countSystem = 1
      let loyalSystem = { role: "system", content: process.env.RAINE_PROMPT_LOYAL }

      // check user boss on Discord
      if(curUser) {
        const userResponse = { role: "system", content: `Please response to this user: ${curUser.globalName}`}
        conversation.push(userResponse)
        loyal && conversation.push(loyalSystem)
        countSystem += 2
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
      log(chalk.yellow.bold("Token: "), numTokens)

      while(condition) { 
        const numTokens = numTokensFromString(JSON.stringify(conversation), model)
        log(chalk.yellow.bold("Token: "), numTokens)
        if(numTokens >= 3500) {
          flagCheckOverToken = true
          conversation.splice(countSystem, 2);
        }
        else 
          condition = false
      }
      numTokens = numTokensFromString(JSON.stringify(conversation), model)

      log(chalk.blue.bold("ConversationPrompt"), conversation);
      log(chalk.yellow.bold("Token before: "), numTokensBefore)
      log(chalk.yellow.bold("Token after: "), numTokens)

      return { 
        newFlag: flagCheckOverToken,
        conversation
      }
    }
}

module.exports = gpt