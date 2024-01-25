const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");


module.exports = (dependencies) => {
    const { useCases: { 
        redisUseCase: { addToConversation, followUpConversation,  }
    } } = dependencies;


    return  async (req, res) => { 
        try {               

            // get the conversation from redis
            const redisFollowUp = followUpConversation(dependencies)
            const conversation = await redisFollowUp.execute({prepareKey: "cam"})
             

            return res.status(200).json({ data: conversation });
            // return { data: conversation }
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }

}
