const chalk = require("chalk");
const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service");
const { log } = require("../../config/log/log.config");
const fs = require('node:fs');
const path = require("node:path");
const RainePrompt = require("../../Raine_prompt_system.json")
const { numTokensFromString } = require("../../utils/index");
const weatherService = require("../functionCalling/weather");
const gpt = require("./function")
class GptService {
  constructor() {
    this.promptMessage = [
      { role: "system", content: process.env.RAINE_PROMPT},
    ],
    this.promptMessageFunc = [
      { role: "system", content: process.env.RAINE_PROMPT},
    ],
    this.promptMessageTTS = []
    this.loyalSystem = { role: "system", content: process.env.RAINE_PROMPT_LOYAL }
    // this.llm_model = "gpt-3.5-turbo"
    this.llm_model = "gpt-4"
    this.llm_max_tokens = 4097
  }
  async ask (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt, lan) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), promptContent);
      
      let loyal = false
      if(curUser.id === process.env.OWNER_ID) loyal = true

      // prepare data system for conversation prompt
      const { countSystem, conversation:preparedConversation } = await gpt.prepare_system_prompt(this.promptMessage, ConversationPrompt, promptContent, curUser, loyal)
      this.promptMessageFunc = preparedConversation

      const { conversation, completion } = await gpt.callGPT("gpt-3.5-turbo", this.promptMessageFunc, maxTokenEachScript, countSystem)
      this.promptMessage = conversation

      const content = completion.choices[0].message.content

      return ({ status: 200, data: content })
    } catch(error) {
      log(error)
      return ({status: 500, error: error})
    }

  }

  async askTTS (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt, lan, guildID) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), promptContent);
      let countSystem = 0
      let flagCheckOverToken = false

      // check language for response
      if(RainePrompt[lan]) {
        this.promptMessageTTS[0] = { role: "system", content: RainePrompt[lan].system }
        ++countSystem
        this.loyalSystem.content = RainePrompt[lan].loyal
      }

      // check user boss on Discord
      if(curUser) {
        const userResponse = { role: "system", content: `Please response to this user: ${curUser.globalName}`}
        curUser.id == process.env.OWNER_ID && this.promptMessageTTS.push(this.loyalSystem)
        this.promptMessageTTS.push(userResponse)
        countSystem += 2
      }

      // prepare data for conversation
      const newMsg = { role: "user", content: promptContent }
      if(ConversationPrompt && ConversationPrompt.length > 0) {
        this.promptMessageTTS = [...this.promptMessageTTS, ...ConversationPrompt]
      }
      this.promptMessageTTS.push(newMsg)

      // check token length
      let condition = true
      let numTokens = numTokensFromString(JSON.stringify(this.promptMessageTTS), "gpt-3.5-turbo")
      let numTokensBefore = numTokens
      log(chalk.yellow.bold("Token: "), numTokens)
      while(condition) {
        const numTokens = numTokensFromString(JSON.stringify(this.promptMessageTTS), "gpt-3.5-turbo")
        log(chalk.yellow.bold("Token: "), numTokens)
        if(numTokens >= 3500) {
          flagCheckOverToken = true
          this.promptMessageTTS.splice(countSystem, 2);
        }
        else 
          condition = false
      }
      numTokens = numTokensFromString(JSON.stringify(this.promptMessageTTS), "gpt-3.5-turbo")
      log(chalk.blue.bold("ConversationPrompt"), this.promptMessageTTS);
      log(chalk.yellow.bold("Token before: "), numTokensBefore)
      log(chalk.yellow.bold("Token after: "), numTokens)

      // if token length over 3500, merge conversation to redis
      if(flagCheckOverToken)
        await redisService.mergeNewConversation(guildID, lan, this.promptMessageTTS)

      // Ask OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: this.promptMessageTTS,
        // model: "gpt-3.5-turbo",
        temperature: 1,
        max_tokens: maxTokenEachScript,
      });
  
      const content = completion.choices[0].message.content
  
      return ({ status: 200, data: content })
    } catch(error) {
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
    try {
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
      
    } catch (error) {
      console.log(error)
    }
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

      const content = completion.choices[0].message.content
      return ({ status: 200, data: content })
      
    } catch (error) {
      log(error)
      return ({status: 500, data: error})
    }
  }

  async functionCalling (promptContent, data, maxTokenEachScript, curUser, ConversationPrompt, lan) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), promptContent);
      const getCurrentWeather = async (location) => {
        return weatherService.getByLocation(location)
        .then(res => {
          const newData = res.data
          const raineWeatherPrompt = RainePrompt.en.weather

          if(newData) {
            const data = {
              content: `
              ${raineWeatherPrompt}: 
              ${JSON.stringify(newData)}
              `,
              role: "user"
            }

            log("Weather prompt:", data)

            return {
              have_content: true,
              data: data
            }
          } else {
            return {
              have_content: false,
              data: null
            }
          }
        })
      }
      const weatherFuncSpec = {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. Ho Chi Minh",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      }
      let loyal = true
      let listFunc = []

      listFunc.push(weatherFuncSpec)

      // prepare data system for conversation prompt
      const { countSystem, conversation:preparedConversation } = await gpt.prepare_system_prompt(this.promptMessageFunc, ConversationPrompt, promptContent, curUser, loyal)
      this.promptMessageFunc = preparedConversation

      // const { conversation, completion } = await gpt.callGPT("gpt-3.5-turbo", this.promptMessageFunc, maxTokenEachScript, countSystem, true, listFunc)

      // this.promptMessageFunc = conversation

      let retry = 0

      while(true) {
        
        log(chalk.green.bold("------------------ REQUEST ------------------"));
  
        const { conversation, completion } = await gpt.callGPT("gpt-3.5-turbo", this.promptMessageFunc, maxTokenEachScript, countSystem, true, listFunc)
  
        this.promptMessageFunc = conversation
  
        // process function calling from tools
        const responseMessage = completion.choices[0].message

        log(chalk.green.bold("Finish_reason"), completion.choices[0].finish_reason )

        if(responseMessage.function_call?.name === "get_current_weather") {
          const args = JSON.parse(responseMessage.function_call.arguments)
          const location = args.location

          log(chalk.green.bold("---> GPT ask to call Weather API with location: "), location);
          

          const weatherData = await getCurrentWeather(location)

          if(!weatherData.have_content) {
            retry ++
            if(retry < 3) {
              continue
            } else {
              return ({ status: 200, data: "Sorry, I can't find the weather for this location"})
            }
          } else {
            this.promptMessageFunc.push(weatherData.data)
          }


        } else if(completion.choices[0].finish_reason === "stop") {
          return ({ status: 200, data: completion.choices[0].message.content })
        }

      }  
    } catch(error) {
      log(error)
      return ({status: 500, error: error})
    }

  }
}


module.exports = GptService
