const { getFileExtension, downloadFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file")

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
            }
        } } = req.body;
        
  
        try {            
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

            return res.status(200).json({ data: JSON.stringify(message) });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}