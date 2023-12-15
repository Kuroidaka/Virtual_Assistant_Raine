module.exports = (dependencies) => {
    const { redisClient } = dependencies

    const execute = async (conversationKeys) => {
        try {
            const minScore = '-inf';
            const maxScore = '+inf';

            const data = await redisClient.zCount(conversationKeys, minScore, maxScore);
            return data
        } catch (err) {
            console.log(err)
        }
    }

    return { execute }
}