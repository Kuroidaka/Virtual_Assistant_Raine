const chalk = require("chalk");

module.exports = (dependencies) => {
    const {
        redisClient,
        useCases: {
            redisUseCase: { countFromConversation }
        }
    } = dependencies;

    const execute = async ({prepareKey}) => {
        let conversationKey = `${prepareKey}:conversation`;

        try {
            // Retrieve the count of messages in the conversation
            const countCon = countFromConversation(dependencies);
            const count = await countCon.execute(conversationKey);
            console.log(chalk.blue("Redis - Pop"), `Conversation Key: ${conversationKey}`);

            if (count > 0) {
                // Pop the message with the lowest score (earliest message)
                const poppedMessage = await redisClient.zPopMax(conversationKey);
                return poppedMessage;
            } else {
                console.log(chalk.yellow("No messages to pop from the conversation"));
                return null;
            }
        } catch (error) {
            console.log(chalk.red('Redis - Error popping message from conversation:'), error);
            return null;
        }
    }

    return { execute };
}
