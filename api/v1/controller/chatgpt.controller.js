
const GptService = require("../../../service/chatGpt/generate")
const redisService = require("../../../service/redis/redis.service")

const chatGpt = { 
    generate: async (req, res) => { 
        
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;

            const conversation = await redisService.followUpWithOlderResponse()
            console.log("conversation after getting ", conversation)
            const prompt = `
            script: (
                ${process.env.RAINE_PROMPT}
                ${curUser.id == process.env.OWNER_ID && process.env.RAINE_PROMPT_LOYAL}
            )
            ${conversation.length > 0 ? "- This is the old conversation:" +  conversation[0][0] : ""}
            - Please response to this user: ${curUser.globalName}
            - This is the prompt: ${data.content}
            `

            const result = await GptService.ask(prompt, data.content, maxTokenEachScript)

            return res.status(200).json({data: result.data})
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },

}

module.exports = chatGpt