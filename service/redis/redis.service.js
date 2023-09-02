const redisClient = require('../../config/redis/redis.config');


const redisService = {
    addToConversation:  async (role, content) => {
        const message = { role, content };
        const conversationKey = "conversation:" + Date.now();
        await redisClient.lPush(conversationKey, JSON.stringify(message));

        const conversationKeys = await redisClient.keys("conversation:*");
        if (conversationKeys.length > 3) {
          const oldestConversationKey = conversationKeys[conversationKeys.length - 1];
          await redisClient.del(oldestConversationKey);
        }
    },
    followUpWithOlderResponse: async () => {

        const conversationKeys = await redisClient.keys("conversation:*");

        const conversationList = []

        for(let i = 0; i < conversationKeys.length; i++) {
            const conversation = await redisClient.lRange(conversationKeys[i], 0, -1);
            conversationList.push(conversation)
    
        }

        console.log("conversationList", conversationList)

        return conversationList
      }
    
}

module.exports = redisService;