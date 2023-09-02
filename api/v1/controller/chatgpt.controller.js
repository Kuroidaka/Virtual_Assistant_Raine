
const GptService = require("../../../service/chatGpt/generate")
const redis = require("../../../config/redis/redis.config")

const chatGpt = { 
    generate: async (req, res) => { 
        
        try{            
            const { data, maxTokenEachScript, curUser } = req.body;
            const prompt = `
            ${process.env.RAINE_PROMPT}
            ${curUser.id == process.env.OWNER_ID && process.env.RAINE_PROMPT_LOYAL}
            This is the current user create prompt nick name: ${curUser.globalName}
            This is the prompt: ${data.content}
            `
            console.log("prompt", prompt)

            const result = await GptService.ask(prompt, maxTokenEachScript)

            return res.status(200).json({data: result.data})
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },

}

module.exports = chatGpt