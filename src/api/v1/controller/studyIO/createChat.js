const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
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

            const storeAIDB = await createConDB(dependencies).execute({
                conversationId: result[0].message.conversationId,
                from,
                text: askAI.data,
                sender: "bot",
                senderID: "-2"
            })

            const newConversation = await getConversations(dependencies).execute({ from: "StudyIO", id: result[0].message.conversationId })

            return res.status(result[1].status).json({
                data: {
                    bot: storeAIDB.message,
                    user: result[0].message,
                    title: result[0].title,
                    newConversation: newConversation
                },
                func: result[1].func})

        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}