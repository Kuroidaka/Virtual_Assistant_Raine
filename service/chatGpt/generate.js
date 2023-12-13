const chalk = require("chalk");
const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service");
const { log } = require("../../config/log/log.config");
const fs = require('node:fs');
const path = require("node:path");
const RainePrompt = require("../../Raine_prompt_system.json")
const { numTokensFromString } = require("../../utils/index");
const weatherService = require("./functionList/weather.func");
const reminderService = require("./functionList/cron/task");
const gpt = require("./gptFeature")
const listFunc = require("./functionList/index")
class GptService {
  constructor() {
    this.promptMessage = []
    this.promptMessageFunc = []
    this.promptMessageTTS = []
  }
  async ask (prompt, maxToken, curUser, conversation, lan = "default", prepareKey) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), prompt);
      let loyal = false
      if(curUser.id === process.env.OWNER_ID) loyal = true

      // prepare data system for conversation prompt
      const { countSystem, conversation:preparedConversation } = await gpt.prepare_system_prompt(this.promptMessage, conversation, prompt, curUser, loyal, "en")
      this.promptMessageFunc = preparedConversation

      const { conversation, completion } = await gpt.callGPT("gpt-3.5-turbo", 0, this.promptMessageFunc, maxToken, countSystem, prepareKey, lan)
      this.promptMessage = conversation

      const content = completion.choices[0].message.content

      return ({ status: 200, data: content })
    } catch(error) {
      log(error)
      return ({status: 500, error: error})
    }

  }

  async askTTS (prompt, maxToken, curUser, conversation, lan = "default", prepareKey) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), prompt);
      let loyal = false
      if(curUser.id === process.env.OWNER_ID) loyal = true

      // prepare data system for conversation prompt
      const { countSystem, conversation:preparedConversation } = await gpt.prepare_system_prompt(this.promptMessageTTS, conversation, prompt, curUser, loyal, lan)
      this.promptMessageTTS = preparedConversation
      
      // Ask OpenAI
      const { conversation, completion } = await gpt.callGPT("gpt-4", 0.7, this.promptMessageFunc, maxToken, countSystem, prepareKey, lan)
      this.promptMessage = conversation

      const content = completion.choices[0].message.content
  
      return ({ status: 200, data: content })
    } catch(error) {
      return ({status: 500, error: error})
    }

  }

  async askImage (prompt, qty = 1) {

    log(chalk.blue.bold("prompt:"), prompt);
    try {
      const response = await openai.images.generate({
        prompt: prompt,
        n: qty,
        size: "1024x1024",
      });
  
      return ({status: 200, data: response.data})
    } catch (error) {
      return ({status: 500, error: error})
    }
    
  }

  async translate(prompt, maxToken) { 

    let promptList = [
      {role: "system", content: process.env.TRANSLATE_PROMPT},
      { role: "user", content: prompt}
    ]

    log(chalk.blue.bold("prompt:"), prompt);

    try {
      await openai.chat.completions.create({
        model: "gpt-4",
        messages: promptList,
        temperature: 0,
        max_tokens: maxToken,
      });

      const content = completion.choices[0].message.content
      return ({ status: 200, data: content })
      
    } catch (error) {
      log(error)
      return ({status: 500, data: error})
    }
  }

  async functionCalling (prompt, maxToken, curUser, conversation, lan = "default", prepareKey, isTalk = false, haveFile) {
    try {
      log(chalk.blue.bold(`prompt:(${lan})`), prompt);
      let loyal = true
      let mainModel = "gpt-4"

      // prepare data system for conversation prompt
      const { countSystem, conversation:preparedConversation } = await gpt.prepare_system_prompt(this.promptMessageFunc, conversation, prompt, curUser, loyal, lan, isTalk)
      this.promptMessageFunc = preparedConversation
      let temperature = 0.5

      let retry = 0

      if(haveFile) {
        const { conversation, completion } = await gpt.callGPT("gpt-4-vision-preview", temperature, this.promptMessageFunc, maxToken, countSystem, prepareKey, lan, false, listFunc)
        this.promptMessageFunc = conversation
        console.log("Response:", completion.choices[0]);
        return ({ status: 200, data: completion.choices[0].message.content })
      }
      
      while(true) {
        
        log(chalk.green.bold("------------------ REQUEST ------------------"));
  
        const { conversation, completion } = await gpt.callGPT(mainModel, temperature, this.promptMessageFunc, maxToken, countSystem, prepareKey, lan, true, listFunc)
  
        this.promptMessageFunc = conversation
        // process function calling from tools
        const responseMessage = completion.choices[0].message

        completion.choices[0].finish_reason && log(chalk.green.bold("Finish_reason"), completion.choices[0].finish_reason )

        if(responseMessage.function_call?.name === "get_current_weather") {
          const args = JSON.parse(responseMessage.function_call.arguments)
          const location = args.location
          const time = args.time
          const date = args.date

          log(chalk.blue.bold("---> GPT ask to call Weather API "), location);
          log(chalk.blue.bold("---> Location: "), location);
          log(chalk.blue.bold("---> time: "), time);
          log(chalk.blue.bold("---> date: "), date);
          
          const weatherData = await weatherService.getByLocation(location, lan, time, date)

          if(!weatherData.have_content) {
            retry ++
            if(retry < 3) {
              continue
            } else {
              return ({ status: 404, data: "Sorry, I can't find the weather for this location"})
            }
          } else {
            this.promptMessageFunc.push(weatherData.data)
          }


        } 
        else if(responseMessage.function_call?.name === "create_reminder") {
          const args = JSON.parse(responseMessage.function_call.arguments)
          const reminder = new reminderService()
          const what_to_do = args.what_to_do
          const period_time = args.period_time
          const specific_time = args.specific_time
          const repeat = args.repeat
          let time = period_time || specific_time

          log(chalk.blue.bold("---> GPT ask to call Cron service "));
          log(chalk.blue.bold("---> what_to_do: "), what_to_do);
          specific_time
            ? log(chalk.blue.bold("---> specific_time: "), specific_time)
            : log(chalk.blue.bold("---> period_time: "), period_time);
          log(chalk.blue.bold("---> repeat: "), repeat);
          // if() return ({ status: 200, data: "Sorry, I can't find the weather for this location"})
          
          if(!what_to_do) {
            this.promptMessageFunc.push({
              role: "user",
              content: "user must provide what to do"
            })
          } else if(!time) {
            this.promptMessageFunc.push({
              role: "user",
              content: "user must provide time"
            })
          } else if(time === "tomorrow") {
            this.promptMessageFunc.push({
              role: "user",
              content: "user must provide time for the tomorrow reminder"
            })
          }
          else {
            const result = await reminder.createJob(what_to_do, time, repeat)
            if(result?.status === 500) {
              // return ({status: 500, error: result.error})
              this.promptMessageFunc.push({
                role: "assistant",
                content: `Error occur while trying to setup reminder, let user know about this bug in create_reminder function: ${result.error}`
              })
            }
            else {
              this.promptMessageFunc.push({
                role: "user",
                content: result.data
              })
            }
          }
        }
        else if(responseMessage.function_call?.name === "follow_up_image_in_chat") {
          const args = JSON.parse(responseMessage.function_call.arguments)
          const image_list = args.image_list
          const prompt = args.prompt

          log(chalk.blue.bold("---> GPT ask to call follow image service "));
          log(chalk.blue.bold("---> image_list: "), image_list);
          log(chalk.blue.bold("---> prompt: "), prompt);

          let content = []

          this.promptMessageFunc.pop()

          if(image_list.length > 0) {
            content = [{type: "text", text: prompt}]
            image_list.forEach(img => content.push({
              type: "image_url",
              image_url: {
                "url": img.url,
              },
            }))
            this.promptMessageFunc.push({
              role: "user",
              content: content
            })         
          }
          else {
            this.promptMessageFunc.push({
              role: "assistant",
              content: "not found any image"
            })
            continue
          }

          const { conversation, completion } = await gpt.callGPT(
            "gpt-4-vision-preview", temperature, this.promptMessageFunc, maxToken, countSystem, prepareKey, lan, false, listFunc
          )
          this.promptMessageFunc = conversation
          log(chalk.blue.bold("Response for asking about image:"), completion.choices[0]);

          return ({ status: 200, data: completion.choices[0].message.content })
        }
        else if(completion.choices[0].finish_reason === "stop") {
          return ({ status: 200, data: completion.choices[0].message.content })
        }

      }  
    } catch(error) {
      return ({status: 500, error: error})
    }

  }
}


module.exports = GptService
