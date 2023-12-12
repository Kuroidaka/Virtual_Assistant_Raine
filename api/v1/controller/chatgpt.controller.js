
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");
const GptService = require("../../../service/chatGpt/generate")
const redisService = require("../../../service/redis/redis.service")
const lanJson = require("../../../language.json")

const chatGpt = { 
    generate: async (req, res) => { 
      
        const { data, maxToken, curUser, type } = req.body;

        let prepareKey
        let prompt
        let promptRedis
        let currentUser
        let files
        let haveFile = false
        let isTask = false

        if(type === "discord") {
            prepareKey = data.prepareKey
            prompt = data.content
            promptRedis = prompt
            currentUser = curUser.globalName
            files = data.files
            
            if(files.length > 0) {// prepare prompt data for file attachment
                prompt = [{
                    type: "text",
                    text: prompt
                }]

                files.forEach(file => {
                    prompt.push({
                        type: "image_url",
                        image_url: {
                          "url": file.url,
                        },
                    })
                }); 
                haveFile = true
                promptRedis = JSON.stringify(prompt)
            }
        }

        // get the conversation from redis
        const conversation = await redisService.followUpWithOlderResponse(prepareKey)

        // add new prompt into redis
        redisService.addToConversation("user", promptRedis, prepareKey)

        // call GPT
        const GPT = new GptService
        const result = await GPT.functionCalling(prompt, maxToken, currentUser, conversation, "default", prepareKey, isTask, haveFile)

        log("Request OPENAI status: ", `${result.status === 200 ? chalk.green.bold(`${result.status}`) : chalk.red.bold(`${result.status}`)}`)
        if(result.status === 200) {
            redisService.addToConversation("assistant", result.data, prepareKey)
            log("Request OPENAI data: ", "{\n\tcontent: ", chalk.green.bold(`${result.data}`), "\n}")
            return res.status(200).json({data: result.data})
        }
        else {
            log("Request OPENAI data: ", "{\n\terror: ", chalk.red.bold(`${result.error}`), "\n}")
            return res.status(500).json({ error: result.error });
        }

    },
    askForFunction: async (req, res) => { 
        try{            
            const { data, maxToken, curUser, lan = "default" } = req.body;

            const guildID = data.guildId
            const conversation = await redisService.followUpWithOlderResponse(guildID, lan)
            
            const prompt = data.content

            const GPT = new GptService
            const result = await GPT.functionCalling(prompt, data, maxToken, curUser, conversation, "en", guildID)

            console.log("Request OPENAI status: ", result.status)
            console.log("Request OPENAI data: ", result.data)
            if(result.status === 200) {
                redisService.addToConversation("user", prompt, data.guildId)
                redisService.addToConversation("assistant", result.data, data.guildId)
                return res.status(200).json({data: result.data})
            }
            else {
                return res.status(500).json({ error: result.error });
            }
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },
    generateForTTS: async (req, res) => { 
        try{            
            const { data, maxToken, curUser, lan } = req.body;

            const guildID = data.guildId
            let isTalk = true

            const conversation = await redisService.followUpWithOlderResponse(guildID, lan)
            
            const prompt = data.content
            
            const GPT = new GptService
            const result = await GPT.functionCalling(prompt, data, maxToken, curUser, conversation, lan, guildID, isTalk)

            if(result.status === 200) {
                redisService.addToConversation("user", prompt, data.guildId, lan)
                redisService.addToConversation("assistant", result.data, data.guildId, lan)
                return res.status(200).json({data: result.data})
            }
            else {
                return res.status(500).json({ error: err });
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },
    generateImg : async (req, res) => {
        const GPT = new GptService
        const { prompt, qty, guildId } = req.body;

        const result = await GPT.askImage(prompt, qty)
        if(result.status === 200) {
            log("image list",result.data)
            redisService.addToConversation("user", prompt, guildId)
            return res.status(200).json({data: result.data})
        }
        else {
            log(error)
            return res.status(500).json({ error: result.error });
        }

    },
    // editImage: async (req, res) => {
    //     const GPT = new GptService
    //     const { prompt, guildId } = req.body;

    //     const result = await GPT.editImage(prompt)
        
    //     if(result.status === 200) {
    //         log("image list",result.data)
    //         redisService.addToConversation("user", prompt, guildId)
    //         return res.status(200).json({data: result.data})
    //     }
    //     else {
    //         log(error)
    //         return res.status(500).json({ error: result.error });
    //     }
        

    // },
    translate: async (req, res) => {

        const { prompt, maxToken } = req.body
            
        try {
            const GPT = new GptService
            
            const result = await GPT.translate(prompt, maxToken)

            return res.status(200).json({ data: result.data })

        } catch (error) {
            return res.status(500).json({ error: error });
        }

    }

}

module.exports = chatGpt