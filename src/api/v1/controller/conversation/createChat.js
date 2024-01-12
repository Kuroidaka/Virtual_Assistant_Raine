
const createChatController = (dependencies) => {
    return async (req, res) => { 
        const { data } = req.body;
        
        try {            
            await createConDB(dependencies).execute(data)
            return res.status(200).json({ data: "created message successfully" });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}

const createConDB = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            createConversation,
            createMessage,
            updateLastMsgCon
         } }
    } } = dependencies;

    const execute = async (data) => {
        try {
            const { 
                conversationId,
                from,
                text,
                sender,
                senderID
            } = data
    
            if(conversationId === "" ) conversationId = null
            let conID = conversationId
            if(!conID) { 
                // Create the conversation
                const conversation = await createConversation(dependencies).execute({
                    name: '',
                    from: from,
                });
                conID = conversation.id;
            }
            // Create the message
            const message = await createMessage(dependencies).execute({
                conversationId: conID,
                text: text,
                sender: sender,
                senderID: senderID
            });
        
            // Update the last message of the conversation
            await updateLastMsgCon(dependencies).execute({
                conversationId: conID,
                lastMessage: text,
                lastMessageAt: message.createdAt
            })
        } catch (error) {
            throw new Error(error)
        }
   
    }

    return { execute }
}



module.exports = { createChatController, createConDB };