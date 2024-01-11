const chalk = require("chalk");
const GptService = require("../../src/service/chatGpt/generate")
const redisService = require("../../../src/service/redis/redis.service")
const lanJson = require("../../../language.json")

const chatGpt = { 
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
            console.log("image list",result.data)
            redisService.addToConversation("user", prompt, guildId)
            return res.status(200).json({data: result.data})
        }
        else {
            console.log(error)
            return res.status(500).json({ error: result.error });
        }

    },
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