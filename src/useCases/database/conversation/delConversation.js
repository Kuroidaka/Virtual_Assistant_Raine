const deleteConversation = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }
    const execute = async ({ conversationId, from }) => {
        if (!conversationId) {
            throw new Error("Conversation ID should be provided");
        }
    
        // First, get all the messages of the conversation
        const messages = await DB.message.findMany({
            where: { 
                conversationId: conversationId
            }
        })
    
        // Then, delete the ImageFiles related to the messages
        for (const message of messages) {
            await DB.imageFile.deleteMany({
                where: { 
                    messageId: message.id
                }
            })
        }
    
        // Next, delete the messages of the conversation
        await DB.message.deleteMany({
            where: { 
                conversationId: conversationId
            }
        })
    
        // Finally, delete the conversation
        const conversation = await DB.conversation.delete({
            where: { 
                id: conversationId, 
                from: from 
            }
        })
    
        return conversation;
    }

    return { execute };
};

module.exports = deleteConversation;