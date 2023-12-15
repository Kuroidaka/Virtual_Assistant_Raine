const redisClient = require('../../config/redis');
const chalk = require("chalk");

const redisService = {
    addToConversation: async (role, content, prepareKey, lan = "default") => {
        const message = { role, content };

        if(role && content ) {
            let conversationKey
            lan === "" ?
                conversationKey = `${prepareKey}:conversation`
            :   conversationKey = `${lan}:${prepareKey}:conversation`

            try {
                let initIndex = 0
                const count = await redisService.countItems(conversationKey)
                console.log(chalk.red("Redis"), `role: ${role} | `,conversationKey );
                if(count) initIndex = count - 1
        
                let index = 0
                await redisClient.zAdd(conversationKey, { score: index + initIndex , value: `${Date.now()}|${JSON.stringify(message)}` });
                
            } catch (error) {
                console.log('Redis - Message added to conversation:', error);
            }
        }
    },
    followUpWithOlderResponse: async (prepareKey, lan = "default") => {
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
    },
    mergeNewConversation: async(prepareKey, lan = "default", newConversation) => {
        const conversationKey = `${lan && lan + ":"}${prepareKey}:conversation`
        try {

            await redisClient.del(conversationKey);

            for (let index = 0; index < newConversation.length; index++) {
                const convMessage = newConversation[index];
                await redisClient.zAdd(conversationKey, { score: index, value: `${Date.now()}|${JSON.stringify(convMessage)}` });
            }
            
        } catch (error) {
            console.log('Redis - Message merger conversation:', error);
        }
    },
    countItems: async (conversationKeys) => {
        try {
            const minScore = '-inf';
            const maxScore = '+inf';

            const data = await redisClient.zCount(conversationKeys, minScore, maxScore);
            return data
        } catch (err) {
            console.log(err)
        }
    },
    clearConversation: async (prepareKey, lan = "default") => {
        let conversationKeys
        lan === "" ?
            conversationKeys = `${prepareKey}:conversation`
        :   conversationKeys = `${lan}:${prepareKey}:conversation`

        try {
            await redisClient.del(conversationKeys);
            console.log(chalk.red("Redis"), `conversationKeys: ${conversationKeys} | `, "deleted" );
            return true
        } catch (error) {
            console.log('Redis - Message deleted conversation:', error);
            return false
        }
    }
    
}

module.exports = redisService;

