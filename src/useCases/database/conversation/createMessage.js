const createMessage = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ conversationId, text, sender, senderID }) => {
        const message = await DB.message.create({
            data: {
                text: text,
                sender: sender,
                senderID: senderID,
                conversation: {
                    connect: {
                        id: conversationId
                    }
                }
            }
        })

        return message;
    }

    return { execute };
};
module.exports = createMessage;