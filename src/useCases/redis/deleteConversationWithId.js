const chalk = require("chalk");

module.exports = (dependencies) => {
    const {
        redisClient, 
        useCases: { 
        }
    } = dependencies

    const execute = async ({prepareKey}) => {
        const key = `${prepareKey}:conversation`;

        try {
            console.log(chalk.red("Redis"), `delete key: `, key);
            
            // Delete the old key
            await redisClient.del(key);
            console.log('Redis - Key updated successfully');
        } catch (error) {
            console.log('Redis - Error updating key:', error);
        }
    }

    return { execute }
}