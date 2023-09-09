const { log } = require('../../config/log/log.config');
const redisClient = require('../../config/redis/redis.config');
const chalk = require("chalk");

const redisService = {
    addToConversation:  (role, content, guildId) => {
        const message = { role, content };

        if(role && content ) {
            const conversationKey = `${guildId}:conversation:${Date.now()}`;
            const expirationInSeconds = 180; // 3 minutes
            
            redisClient.lPush(conversationKey, JSON.stringify(message), (error, result) => {
                if (error) {
                    console.error('Redis - addToConversation - lPush - Error adding message to conversation:', error);
                } else {
                    console.log('Redis - Message added to conversation:', result);
                }
            })
    
            redisClient.expire(conversationKey, expirationInSeconds);
        }
    },
    followUpWithOlderResponse: async (guildId) => {

        const conversationKeys = await redisClient.keys(`${guildId}:conversation:*`);

        const conversationList = []

        for(let i = 0; i < conversationKeys.length; i++) {
            const conversation = await redisClient.lRange(conversationKeys[i], 0, -1);

            if(conversation) {
                const msgObj = JSON.parse(conversation[0])
                conversationList.push(msgObj)
            }
        }

        return conversationList
      }
    
}

module.exports = redisService;