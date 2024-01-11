const updateLastMsgCon = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ conversationId, lastMessage, lastMessageAt }) => {
        const newConversation = await DB.conversation.update({
            where: { id: conversationId },
            data: {
              lastMessage: lastMessage,
              lastMessageAt: new Date(lastMessageAt)
            },
          });

        return newConversation;
    }

    return { execute };
};

module.exports = updateLastMsgCon;