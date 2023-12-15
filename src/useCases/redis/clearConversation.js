const chalk = require("chalk")

module.exports = (dependencies) => {
    const { redisClient } = dependencies

    const execute = async ({prepareKey}) => {
        let conversationKeys
        conversationKeys = `${prepareKey}:conversation`

        try {
            await redisClient.del(conversationKeys);
            console.log(chalk.red("Redis"), `conversationKeys: ${conversationKeys} | `, "deleted" );
            return true
        } catch (error) {
            console.log('Redis - Message deleted conversation:', error);
            return false
        }
    }

    return { execute }
}