
const { log } = require("../../../config/log/log.config");
const GptService = require("../../../service/chatGpt/generate")
const redisService = require("../../../service/redis/redis.service")
const lanJson = require("../../../language.json")

const chatGpt = { 
    generate: async (req, res) => { 
        let error
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;

            const guildID = data.guildId
            const ConversationPrompt = await redisService.followUpWithOlderResponse(guildID)
            
            const prompt = data.content
            redisService.addToConversation("user", prompt, data.guildId)
            const GPT = new GptService
            const result = await GPT.functionCalling(prompt, data, maxTokenEachScript, curUser, ConversationPrompt)

            console.log("Request OPENAI status: ", result.status)
            console.log("Request OPENAI data: ", result.data)
            if(result.status === 200) {
                redisService.addToConversation("assistant", result.data, data.guildId)
                return res.status(200).json({data: result.data})
            }
            else {
                error = result.error
            }
            // const summary = await GptService.ask(`
            // Please provide a brief summary of the main points in the following text
            // ${result.data}`, data, maxTokenEachScript, curUser, ConversationPrompt)
            
        } catch (err) {
            console.error(error);
            return res.status(500).json({ error: error });
        }

    },
    askForFunction: async (req, res) => { 
        let error
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;

            const guildID = data.guildId
            const ConversationPrompt = await redisService.followUpWithOlderResponse(guildID)
            
            // const prompt = data.content
            const prompt = "What's the weather like in in Ho Chi Minh"
            redisService.addToConversation("user", prompt, data.guildId)
            const GPT = new GptService
            const result = await GPT.functionCalling(prompt, data, maxTokenEachScript, curUser, ConversationPrompt)

            console.log("Request OPENAI status: ", result.status)
            console.log("Request OPENAI data: ", result.data)
            if(result.status === 200) {
                redisService.addToConversation("assistant", result.data, data.guildId)
                return res.status(200).json({data: result.data})
            }
            else {
                error = result.error
            }
            // const summary = await GptService.ask(`
            // Please provide a brief summary of the main points in the following text
            // ${result.data}`, data, maxTokenEachScript, curUser, ConversationPrompt)
            
        } catch (err) {
            console.error(error);
            return res.status(500).json({ error: error });
        }

    },
    generateForTTS: async (req, res) => { 
        let error
        try{            
            const { data, maxTokenEachScript, curUser, lan } = req.body;

            const guildID = data.guildId

            const ConversationPrompt = await redisService.followUpWithOlderResponse(guildID, lan)
            
            const prompt = data.content
            redisService.addToConversation("user", prompt, data.guildId, lan)
            const GPT = new GptService
            const result = await GPT.askTTS(prompt, data, maxTokenEachScript, curUser, ConversationPrompt, lan, guildID)

            if(result.status === 200) {
                redisService.addToConversation("assistant", result.data, data.guildId, lan)
                return res.status(200).json({data: result.data})
            }
            else {
                error = result.error
            }

        } catch (err) {
            console.error(error);
            return res.status(500).json({ error: error });
        }

    },
    generateImg : async (req, res) => {
        const GPT = new GptService
        const { prompt, qty, guildId } = req.body;

        try {
            const result = await GPT.askImage(prompt, qty)
            
            log("image list",result.data)
            redisService.addToConversation("user", prompt, guildId)
            return res.status(200).json({data: result.data})
        } catch (error) {
            log(error)
            return res.status(500).json({ error: error });
        }
    },
    editImage: async (req, res) => {
        const GPT = new GptService
        const { prompt, guildId } = req.body;

        try {
            const result = await GPT.editImage(prompt)
            
            // redisService.addToConversation("user", prompt, guildId)
            return res.status(200).json({data: result.data})
        } catch (error) {
            log(error)
            return res.status(500).json({ error: error });
        }
    },
    translate: async (req, res) => {

        const { prompt, maxTokenEachScript } = req.body
            
        try {
            const GPT = new GptService
            
            const result = await GPT.translate(prompt, maxTokenEachScript)

            return res.status(200).json({ data: result.data })

        } catch (error) {
            return res.status(500).json({ error: error });
        }

    }

}

module.exports = chatGpt