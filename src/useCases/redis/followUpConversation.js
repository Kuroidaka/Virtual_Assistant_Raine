module.exports = (dependencies) => {
    const { redisClient } = dependencies

    const execute = async ({prepareKey, lan = "default"}) => {
        let conversationKeys
        console.log("language", lan)
        lan === "" ?
            [conversationKeys] = await redisClient.keys(`${prepareKey}:conversation`)
            :[conversationKeys] = await redisClient.keys(`${lan}:${prepareKey}:conversation`);
            
            if(!conversationKeys) return []

            console.log("conversationKeys", conversationKeys)
        const conversationList = []
        try {
            const conversation = await redisClient.zRange(conversationKeys, 0, -1);
            conversation.forEach(result => {
                let data = JSON.parse(result.substring(14,result.length))

                if(data) {
                    const msgObj = data
                    conversationList.push(msgObj)
                }
            });
        } catch (error) {
            console.error('Error retrieving items from Redis:', error);
        }

        return conversationList
    }

    return { execute }
}