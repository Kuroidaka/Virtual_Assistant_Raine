const chalk = require("chalk")

module.exports = (dependencies) => {
    const { useCases: { 
        openAiUseCase: { askOpenAIUseCase },
        redisUseCase: { addToConversation, followUpConversation, popConversation }
    } } = dependencies;

    return async (req, res) => { 
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
            curUser = {
                name: currentUser.globalName,
                id: currentUser.id
            }
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
        try {
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
                haveFile,
                resource: "azure"
            })
    
            console.log("Request OPENAI status: ", `${result.status === 200 ? chalk.green.bold(`${result.status}`) : chalk.red.bold(`${result.status}`)}`)
            if(result.status === 200) {
                // add new response into redis
                const redisAddData = {
                    role: "assistant",
                    content: result.data,
                    prepareKey: prepareKey
                }
                await redisAdd.execute(redisAddData)

                let dataResponse = result.data
                console.log("Request OPENAI data: ", "{\n\tcontent: ", chalk.green.bold(`${dataResponse}`), "\n}")

                if(result.image_list && result.image_list.length > 0) {
                    dataResponse = result.image_list
                }
                return res.status(result.status).json({data: dataResponse, func: result.func})
            }
            else {
                throw Error(result.error)
            }
    
        } catch (error) {
            console.log("Request OPENAI data: ", "{\n\terror: ", chalk.red.bold(`${error}`), "\n}")
            const redisPop = popConversation(dependencies)
            const redisPopData = {prepareKey: prepareKey}
            await redisPop.execute(redisPopData)
            return res.status(500).json({ error: error });
        }
   
    }
}