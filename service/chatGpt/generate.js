const chalk = require("chalk");
const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service");
const { log } = require("../../config/log/log.config");

const GptService = {
  ask: async (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt) => {
    try {
      log(chalk.blue.bold("prompt:"), promptContent);

      let promptMessage = [
        { role: "system", content: process.env.RAINE_PROMPT},
        { role: "system", content: `Please response to this user: ${curUser.globalName}`}
      ]

      const newMsg = { role: "user", content: promptContent }
      const loyalSystem = { role: "system", content: process.env.RAINE_PROMPT_LOYAL }

      curUser.id == process.env.OWNER_ID && promptMessage.push(loyalSystem)
      promptMessage.push(newMsg)
    
      if(ConversationPrompt.length > 0) {
        promptMessage = [...promptMessage, ...ConversationPrompt]
      }

      log(chalk.blue.bold("ConversationPrompt"), promptMessage);

      const completion = await openai.chat.completions.create({
        // model: 'text-davinci-003',
        messages: promptMessage,
        model: "gpt-3.5-turbo",
        temperature: 1,
        max_tokens: maxTokenEachScript
      });
  
      const generatedResponse = completion.choices[0].message.content
  
      return ({ status: 200, data: generatedResponse })
    } catch(error) {
      console.log(error)
      return ({status: 500, error: error})
      // Consider adjusting the error handling logic for your use case
      // if (error.response) {
      //   console.error(
      //     // error.response.status,
      //      error.response.data);
      //   return ({
      //     // status: error.response.status,
      //     error: error.response.data,
      //   })
      // } else {
      //   console.error(`Error with OpenAI API request: ${error.message}`);
      //   return ({
      //     status: 500,
      //     error: {
      //       message: 'An error occurred during your request.',
      //     }
      //   })
      // }
    }

  }  
}


module.exports = GptService