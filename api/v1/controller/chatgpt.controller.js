
const GptService = require("../../../service/chatGpt/generate")
const redisService = require("../../../service/redis/redis.service")

const chatGpt = { 
    generate: async (req, res) => { 
        
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;

            const guildID = data.guildId

            const ConversationPrompt = await redisService.followUpWithOlderResponse(guildID)
            
            const prompt = data.content
            redisService.addToConversation("user", prompt, data.guildId)
            const result = await GptService.ask(prompt, data, maxTokenEachScript, curUser, ConversationPrompt)
            // const summary = await GptService.ask(`
            // Please provide a brief summary of the main points in the following text
            // ${result.data}`, data, maxTokenEachScript, curUser, ConversationPrompt)
            redisService.addToConversation("assistant", result.data.choices[0].message.content, data.guildId)


            return res.status(200).json({data: result.data.choices[0].message.content})
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },

}

module.exports = chatGpt