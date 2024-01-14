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
                    isAttachedFile=false

            } } = req.body;
        
  
        try {            
            

            const storeDB = await createConDB(dependencies).execute({ // store user message to DB
                conversationId,
                from,
                text,
                sender,
                senderID
            })

            const askAI = await askingAI(dependencies).execute({ // ask AI
                prepareKey: storeDB.conversationId, // conversation key
                promptRedis: text, // prompt for redis,
                prompt: text, // prompt for openAI
                maxToken: maxToken, 
                curUser: {
                    name: sender,
                    id: senderID
                }, //{name, id}
                haveFile: {
                    img: false,
                    docs: isAttachedFile
                }, // check if the request has file attachment
                isTask: false // false
            })

            let storeAiDBList = []
            if(Array.isArray(askAI.data)) { // Image response
                const promise = []
                // store AI response(img) to DB
                askAI.data.forEach((msg) => {

                    promise.push(createConDB(dependencies).execute({
                        conversationId: storeDB.message.conversationId,
                        from,
                        text: msg,
                        sender: "bot",
                        senderID: "-2"
                    }))
                })

                const newStoreList = await Promise.all(promise)
                storeAiDBList = newStoreList.map(store => store.message)


            } else {

                // store AI response to DB
                const storeAIDB = await createConDB(dependencies).execute({
                    conversationId: storeDB.message.conversationId,
                    from,
                    text: askAI.data,
                    sender: "bot",
                    senderID: "-2"
                })
                storeAiDBList[0] = storeAIDB.message
            }


            // get the whole conversation
            const newConversation = await getConversations(dependencies).execute({ from: "StudyIO", id: storeDB.message.conversationId })

            return res.status(askAI.status).json({
                data: {
                    bot: storeAiDBList,
                    user: storeDB.message,
                    title: storeDB.title,
                    newConversation: newConversation,
                    isNewConversation: storeDB.isNewConversation
                },
                func: askAI.func})

        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}