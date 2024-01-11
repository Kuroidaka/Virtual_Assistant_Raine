const getConversations = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async () => {
        const conversations = await DB.conversation.findMany({
            include: { messages: true }
        });
        
        return conversations;
    }

    return { execute };
};
module.exports = getConversations;