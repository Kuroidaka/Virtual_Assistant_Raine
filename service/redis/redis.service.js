const { log } = require('../../config/log/log.config');
const redisClient = require('../../config/redis/redis.config');
const chalk = require("chalk");

const redisService = {
    addToConversation: async (role, content, guildId, lan = "") => {
        const message = { role, content };

        if(role && content ) {
            let conversationKey
            lan === "" ?
                conversationKey = `${guildId}:conversation`
            :   conversationKey = `${lan}:${guildId}:conversation`

            try {
                let initIndex = 0
                const count = await redisService.countItems(conversationKey)
                log(chalk.red("Redis"), conversationKey );
                log(chalk.magenta(`Count in Conversation: ${count}`));
                if(count) initIndex = count - 1
        
                let index = 0
                await redisClient.zAdd(conversationKey, { score: index + initIndex , value: `${Date.now()}|${JSON.stringify(message)}` });
                
            } catch (error) {
                console.log('Redis - Message added to conversation:', error);
            }
        }
    },
    followUpWithOlderResponse: async (guildId, lan = "default") => {
        let conversationKeys
        console.log("language", lan)
        lan === "" ?
            [conversationKeys] = await redisClient.keys(`${guildId}:conversation`)
            :[conversationKeys] = await redisClient.keys(`${lan}:${guildId}:conversation`);
            
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
    mergeNewConversation: async(guildID, lan = "default", newConversation) => {
        const conversationKey = `${lan && lan + ":"}${guildID}:conversation`
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
    }
    
}

module.exports = redisService;

