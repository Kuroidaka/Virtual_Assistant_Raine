const chalk = require("chalk");
const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service");
const { log } = require("../../config/log/log.config");
const fs = require('node:fs');
const path = require("node:path");


class GptService {
  constructor() {
    this.promptMessage = [
      { role: "system", content: process.env.RAINE_PROMPT},
    ],
    this.loyalSystem = { role: "system", content: process.env.RAINE_PROMPT_LOYAL }
  }
  async ask (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt) {
    try {
      log(chalk.blue.bold("prompt:"), promptContent);

      if(curUser) {
        const userResponse = { role: "system", content: `Please response to this user: ${curUser.globalName}`}
        curUser.id == process.env.OWNER_ID && this.promptMessage.push(this.loyalSystem)
        this.promptMessage.push(userResponse)
      }
      
      const newMsg = { role: "user", content: promptContent }

      if(ConversationPrompt && ConversationPrompt.length > 0) {
        this.promptMessage = [...this.promptMessage, ...ConversationPrompt]
      }

      this.promptMessage.push(newMsg)

      log(chalk.blue.bold("ConversationPrompt"), this.promptMessage);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: this.promptMessage,
        // model: "gpt-3.5-turbo",
        temperature: Number(process.env.TEMPLATE_GPT),
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

  async editImage() {

    const commandsPath = path.join(__dirname, '../../assert/image/image_edit_original.png');
    const mask = path.join(__dirname, '../../assert/image/image_edit_mask.png');

    console.log("commandsPath", commandsPath)
    const image = await openai.images.edit({
      image: fs.createReadStream(commandsPath),
      mask: fs.createReadStream(mask),
      prompt: "A cute baby sea otter wearing a beret",
    });
  
    console.log(image.data);
    return image
  }

  async translate(promptContent, maxTokenEachScript) { 

    let promptList = [
      {role: "system", content: process.env.TRANSLATE_PROMPT},
      { role: "user", content: promptContent}
    ]

    log(chalk.blue.bold("prompt:"), promptContent);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: promptList,
        temperature: 0,
        max_tokens: maxTokenEachScript,
      });
  
      return ({ status: 200, data: response })
      
    } catch (error) {
      log(error)
      return ({status: 500, data: error})
    }
  }
}


module.exports = GptService
