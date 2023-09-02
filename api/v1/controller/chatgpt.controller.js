
const GptService = require("../../../service/chatGpt/generate")
const redisService = require("../../../service/redis/redis.service")

const chatGpt = { 
    generate: async (req, res) => { 
        
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;

            const guildID = data.guildId

            const conversation = await redisService.followUpWithOlderResponse(guildID)
            
            let ConversationPrompt = []
            if(Array.isArray(conversation)) {
                conversation.forEach((conv) => {
                    const msgObj = JSON.parse(conv[0])
                    ConversationPrompt.push(msgObj)
                })

            }
            const prompt = data.content
            redisService.addToConversation("user", prompt, data.guildId)
            const result = await GptService.ask(prompt, data, maxTokenEachScript, curUser, ConversationPrompt)

            return res.status(200).json({data: result.data})
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },

}

module.exports = chatGpt