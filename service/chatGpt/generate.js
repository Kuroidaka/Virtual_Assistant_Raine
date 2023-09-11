const chalk = require("chalk");
const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service");
const { log } = require("../../config/log/log.config");


const loyalSystem = { role: "system", content: process.env.RAINE_PROMPT_LOYAL }

class GptService {
  constructor() {
    this.promptMessage = [
      { role: "system", content: process.env.RAINE_PROMPT},
    ]
  }
  async ask (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt) {
    try {
      log(chalk.blue.bold("prompt:"), promptContent);

      if(curUser) {
        const userResponse = { role: "system", content: `Please response to this user: ${curUser.globalName}`}
        curUser.id == process.env.OWNER_ID && this.promptMessage.push(loyalSystem)
        this.promptMessage.push(userResponse)
      }
      
      const newMsg = { role: "user", content: promptContent }

      if(ConversationPrompt && ConversationPrompt.length > 0) {
        this.promptMessage = [...this.promptMessage, ...ConversationPrompt]
      }

      this.promptMessage.push(newMsg)

      log(chalk.blue.bold("ConversationPrompt"), this.promptMessage);

      const completion = await openai.chat.completions.create({
        // model: 'text-davinci-003',
        messages: this.promptMessage,
        model: "gpt-3.5-turbo",
        temperature: .6,
        max_tokens: maxTokenEachScript
      });
  
      const generatedResponse = completion
  
      return ({ status: 200, data: generatedResponse })
    } catch(error) {
      console.log(error)
      return ({status: 500, error: error})
    }

  }
  async askImage (promptContent, qty = 1) {

    log(chalk.blue.bold("prompt:"), promptContent);
    try {
      const response = await openai.images.generate({
        prompt: promptContent,
        n: qty,
        size: "1024x1024",
      });
  
      return ({status: 200, data: response.data})
    } catch (error) {
      return ({status: 500, error: error})
    }
    
  }
}


module.exports = GptService