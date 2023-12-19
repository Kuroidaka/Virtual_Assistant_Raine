const common = require("./common")
const funcCall = require("./funcCall")
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
      lan = "default",
      prepareKey,
      isTalk = false,
      haveFile
    }) => {
      try {
        let currentLang = "en"
        if(typeof prompt === 'string' || prompt instanceof String) {
          currentLang = language.languages[detectLan(prompt)]
        }
        else {
          const textFromPrompt = prompt.find(msg => typeof msg.text === 'string' || msg.text instanceof String).text
          currentLang = language.languages[detectLan(textFromPrompt)]
        }
       
        console.log(chalk.blue.bold(`prompt:(${currentLang})`), prompt);
        let loyal = true
  
        // prepare data system for conversation prompt
        const preparePrompt = common.prepareSystemPromptCommon()
        const prepareData = {
          conversation: this.promptMessageFunc,
          oldConversation: conversation,
          userPrompt: prompt,
          curUser: curUser,
          loyal: loyal,
          isTalk : false,
          lang: currentLang
        }
        const { 
          countSystem,
          conversation:preparedConversation
        } = await preparePrompt.execute(prepareData)
        this.promptMessageFunc = preparedConversation

        let temperature = 0.5
        let retry = 0
  
        if(haveFile) {// Read image
          const callGpt = common.callGPTCommon(this.dependencies)
          const gptData = {
            model: "gpt-4-vision-preview",
            temperature: temperature,
            conversation: this.promptMessageFunc,
            maxToken: maxToken,
            systemMsgCount: countSystem,
            prepareKey: prepareKey,
            lan: lan,
            functionCall: false
          }
          const { conversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = conversation

          // send the response data back to user
          console.log("Response:", completion.choices[0]);
          return ({ status: 200, data: completion.choices[0].message.content })
        }
        
        // get defind function calling
        const funcList = await funcCall()

        while(true) {
          
          console.log(chalk.green.bold("------------------ REQUEST ------------------"));
    
          const callGpt = common.callGPTCommon(this.dependencies)
          const gptData = {
            model: "gpt-4",
            temperature: temperature,
            conversation: this.promptMessageFunc,
            maxToken: maxToken,
            systemMsgCount: countSystem,
            prepareKey: prepareKey,
            lan: lan,
            functionCall: true,
            listFunc: funcList.listFuncSpec
          }
          const { conversation, completion } = await callGpt.execute(gptData)
          this.promptMessageFunc = conversation

          // process function calling from tools
          const responseMessage = completion.choices[0].message
          completion.choices[0].finish_reason && console.log(chalk.green.bold("Finish_reason"), completion.choices[0].finish_reason )
  
          if(responseMessage.function_call?.name === "get_current_weather") {
            const args = JSON.parse(responseMessage.function_call.arguments)
            const location = args.location
            const time = args.time
            const date = args.date
  
            console.log(chalk.blue.bold("---> GPT ask to call Weather API "), location);
            console.log(chalk.blue.bold("---> Location: "), location);
            console.log(chalk.blue.bold("---> time: "), time);
            console.log(chalk.blue.bold("---> date: "), date);
            
            const weatherData = await funcList.func.weatherFunc.getByLocation(location, lan, time, date)
  
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
            const what_to_do = args.what_to_do
            const period_time = args.period_time
            const specific_time = args.specific_time
            const repeat = args.repeat
            let time = period_time || specific_time
  
            console.log(chalk.blue.bold("---> GPT ask to call Cron service "));
            console.log(chalk.blue.bold("---> what_to_do: "), what_to_do);
            specific_time
              ? console.log(chalk.blue.bold("---> specific_time: "), specific_time)
              : console.log(chalk.blue.bold("---> period_time: "), period_time);
            console.log(chalk.blue.bold("---> repeat: "), repeat);
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
              const result = await funcList.func.reminderFunc.createJob(what_to_do, time, repeat)
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
  
            console.log(chalk.blue.bold("---> GPT ask to call follow image service "));
            console.log(chalk.blue.bold("---> image_list: "), image_list);
            console.log(chalk.blue.bold("---> prompt: "), prompt);
  
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

            const callGpt = common.callGPTCommon(this.dependencies)
            const gptData = {
              model: "gpt-4-vision-preview",
              temperature: temperature,
              conversation: this.promptMessageFunc,
              maxToken: maxToken,
              systemMsgCount: countSystem,
              prepareKey: prepareKey,
              lan: lan,
              functionCall: false
            }
            const { conversation, completion } = await callGpt.execute(gptData)
            this.promptMessageFunc = conversation
            console.log(chalk.blue.bold("Response for asking about image:"), completion.choices[0]);
  
            return ({ status: 200, data: completion.choices[0].message.content })
          }
          else if(responseMessage.function_call?.name === "generate_image") {
            const args = JSON.parse(responseMessage.function_call.arguments)
            const model = args.model
            let n = args.model === "dall-e-3" ? 1 : Number(args.n)
            const prompt = args.prompt
            const size = args.size
  
            console.log(chalk.blue.bold("---> GPT ask to call generate image "));
            console.log(chalk.blue.bold("---> model: "), model);
            console.log(chalk.blue.bold("---> n: "), args.n);
            console.log(chalk.blue.bold("---> prompt: "), prompt);
            console.log(chalk.blue.bold("---> size: "), size);

            const dalleData = { 
              model: model,
              prompt: prompt,
              quality: "standard",
              size: size,
              n: n,
              style: "vivid" 
            }

            const imgList = []
            let content = ""
            if(args.model === "dall-e-3") {
              let promises = [];
              for(let i = 0; i < args.n; i++) {
                  promises.push(funcList.func.generateImageFunc.execute(dalleData));
              }

              await Promise.all(promises).then(responses => {
                responses.forEach((response, i) => {
                    if(response) {
                        const img = response.data[0];
                        imgList.push(img.url);
                        content += `Image ${i + 1}: ${img.revised_prompt ? img.revised_prompt : ""}\nURL: ${img.url}\n`;
                    } else {
                        this.promptMessageFunc.push({
                            role: "user",
                            content: "Sorry, I can't generate any image"
                        });
                    }
                });
            }).catch(() => {
              this.promptMessageFunc.push({
                role: "user",
                content: `Sorry, I can't generate any image` 
              });
            });

              this.promptMessageFunc.push({
                role: "assistant",
                content: content
              })

              return ({ status: 200, data: content, image_list: imgList })
            }
            else {
              const response = await funcList.func.generateImageFunc.execute(dalleData)
  
              if(response) {
                response.data.forEach((img, idx) => {
                  imgList.push(img.url)
                  content += `Image ${idx + 1}: ${img.revised_prompt ? img.revised_prompt: ""}\nURL: ${img.url}\n`
                })
                
                this.promptMessageFunc.push({
                  role: "assistant",
                  content: content
                })
                
                return ({ status: 200, data: content, image_list: imgList })
              }
              else {
                this.promptMessageFunc.push({
                  role: "user",
                  content: "Sorry, I can't generate any image"
                })
              }
            }

          }
          else if(completion.choices[0].finish_reason === "stop") {
            return ({ status: 200, data: completion.choices[0].message.content })
          }
  
        }  
      } catch(error) {
        return ({status: 500, error: `at File: ${__filename}\n\t${error}`})
      }
  
    }
}
