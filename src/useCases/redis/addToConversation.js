const chalk = require("chalk");

module.exports = (dependencies) => {
    const {
        redisClient, 
        useCases: { 
            redisUseCase: { countFromConversation }
        }
    } = dependencies

    const execute = async ({role, content, prepareKey, lan = "default"}) => {
        const message = { role, content };

        if(role && content ) {
            let conversationKey
            lan === "" ?
                conversationKey = `${prepareKey}:conversation`
            :   conversationKey = `${lan}:${prepareKey}:conversation`

            try {
                let initIndex = 0
                const count = await countFromConversation(conversationKey)
                console.log(chalk.red("Redis"), `role: ${role} | `,conversationKey );
                if(count) initIndex = count - 1
        
                let index = 0
                await redisClient.zAdd(conversationKey, { score: index + initIndex , value: `${Date.now()}|${JSON.stringify(message)}` });
                
            } catch (error) {
                console.log('Redis - Message added to conversation:', error);
            }
        }
    }

    return { execute }
}