const createConversation = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ name, from }) => {
        const conversation = await DB.conversation.create({
            data: {
                name: name,
                from: from,
                lastMessage: '',
                lastMessageAt: new Date()
            }
        })

        return conversation;
    }

    return { execute };
};

module.exports = createConversation;