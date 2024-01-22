const chalk = require("chalk");

module.exports = (dependencies) => {
    const {
        redisClient, 
        useCases: { 
            redisUseCase: { mergeConversation, followUpConversation }
        }
    } = dependencies

    const execute = async ({prepareKey, newKeyUpdate}) => {
        const oldKey = `${prepareKey}:conversation`;
        const newKey = `${newKeyUpdate}:conversation`;

        try {
            console.log(chalk.red("Redis"), `Updating key: `, oldKey, ' to ', newKey);
            
            // Get the value associated with the old key
            const value = await followUpConversation(dependencies).execute({prepareKey: prepareKey});
            
            // Set the new key with the old value
            await mergeConversation(dependencies).execute(newKeyUpdate, value);
            
            // Delete the old key
            await redisClient.del(oldKey);
            console.log('Redis - Key updated successfully');
        } catch (error) {
            console.log('Redis - Error updating key:', error);
        }
    }

    return { execute }
}