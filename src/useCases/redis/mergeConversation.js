module.exports = (dependencies) => {
    const { redisClient } = dependencies

    const execute = async(prepareKey, newConversation) => {
        const conversationKey = `${prepareKey}:conversation`
        try {

            await redisClient.del(conversationKey);

            for (let index = 0; index < newConversation.length; index++) {
                const convMessage = newConversation[index];
                await redisClient.zAdd(conversationKey, { score: index, value: `${Date.now()}|${JSON.stringify(convMessage)}` });
            }
            
        } catch (error) {
            console.log('Redis - Message merger conversation:', error);
        }
    }

    return { execute }
}