const chalk = require("chalk")

module.exports = (dependencies) => {
    const { useCases: { 
        openAiUseCase: { askOpenAIUseCase },
        redisUseCase: { addToConversation, followUpConversation }
    } } = dependencies;

    return async (req, res) => { 
        try {
            const { data, maxToken, currentUser, type } = req.body;

            let prepareKey
            let prompt
            let promptRedis
            let curUser
            let files
            let haveFile = false
            let isTask = false
    
            if(type === "discord") {// if the request is from discord
                prepareKey = data.prepareKey
                prompt = data.content
                promptRedis = prompt
                curUser = currentUser.globalName
                files = data.files
                
                if(files.length > 0) {// prepare prompt data for file attachment
                    prompt = [{
                        type: "text",
                        text: prompt
                    }]
    
                    files.forEach(file => {
                        prompt.push({
                            type: "image_url",
                            image_url: {
                              "url": file.url,
                            },
                        })
                    }); 
                    haveFile = true
                    promptRedis = JSON.stringify(prompt)
                }
            }
    
            // get the conversation from redis
            const redisFollowUp = followUpConversation(dependencies)
            const conversation = await redisFollowUp.execute({prepareKey})
    
            // add new prompt into redis

            const redisAdd = addToConversation(dependencies)
            const redisAddData = {
                role: "user",
                content: promptRedis,
                prepareKey: prepareKey
            }
            await redisAdd.execute(redisAddData)
    
            // call GPT
            const askOpenAi = new askOpenAIUseCase(dependencies)
            const result = await askOpenAi.execute({
                prompt,
                maxToken,
                curUser,
                conversation,
                prepareKey,
                isTask,
                haveFile
            })
    
            console.log("Request OPENAI status: ", `${result.status === 200 ? chalk.green.bold(`${result.status}`) : chalk.red.bold(`${result.status}`)}`)
            if(result.status === 200) {
                const redisAddData = {
                    role: "assistant",
                    content: result.data,
                    prepareKey: prepareKey
                }
                await redisAdd.execute(redisAddData)

                console.log("Request OPENAI data: ", "{\n\tcontent: ", chalk.green.bold(`${result.data}`), "\n}")
                return res.status(result.status).json({data: result.data})
            }
            else {
                throw Error(result.error)
            }
    
        } catch (error) {
            console.log("Request OPENAI data: ", "{\n\terror: ", chalk.red.bold(`${error}`), "\n}")
            return res.status(500).json({ error: error });
        }
   
    }
}