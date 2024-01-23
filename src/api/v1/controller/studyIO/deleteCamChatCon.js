const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");


module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
        } },
        redisUseCase: { deleteConversationWithId }
    } } = dependencies;


    return async (req, res) => { 
        try {            
     

            await deleteConversationWithId(dependencies).execute({
                prepareKey: "cam"
            })
            return res.status(200).json({ data: "success" });
        } catch (error) {
            return res.status(500).json({ error: error });
        }
   
    }
}