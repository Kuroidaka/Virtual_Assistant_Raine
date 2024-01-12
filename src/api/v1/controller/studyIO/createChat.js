const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            createConversation,
            createMessage,
            updateLastMsgCon
         } }
    } } = dependencies;

    return async (req, res) => { 
        const { data: {
                    conversationId,
                    from,
                    messages: {
                        text,
                        sender,
                        senderID
                    },
                    maxToken,

            } } = req.body;
        
  
        try {            
            const storeDB = await createConDB(dependencies).execute({
                conversationId,
                from,
                text,
                sender,
                senderID
            })

            const askAI = await askingAI(dependencies).execute({
                prepareKey: conversationId, // conversation key
                promptRedis: text, // prompt for redis,
                prompt: text, // prompt for openAI
                maxToken: maxToken, 
                curUser: {
                    name: sender,
                    id: senderID
                }, //{name, id}
                haveFile: false, // check if the request has file attachment
                isTask: false // false
            })

            const result = await Promise.all([storeDB, askAI])
            return res.status(result[1].status).json({data: result[1].data, func: result[1].func})

        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}