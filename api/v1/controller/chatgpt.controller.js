
const GptService = require("../../../service/chatGpt/generate")

const chatGpt = { 
    generate: async (req, res) => { 
        
        try{            
            const { prompt } = req.body;
            console.log("prompt", prompt)

            const result = await GptService(prompt)

            return res.status(200).json({data: result.data})
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

    },

}

module.exports = chatGpt