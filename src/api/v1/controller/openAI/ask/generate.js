const chalk = require("chalk")

const generateController = (dependencies) => {

    return async (req, res) => { 
        const { data, maxToken, currentUser, type, isTalking=false } = req.body;
        let prepareKey
        let prompt
        let promptRedis
        let curUser
        let files
        let haveFile = {
            img: false,
            docs: false
        }

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
                haveFile.img = true
                promptRedis = JSON.stringify(prompt)
            }
        }
        try {
            const result = await askingAI(dependencies).execute({
                prepareKey, // conversation key
                promptRedis, // prompt for redis,
                prompt, // prompt for openAI
                maxToken, 
                curUser, //{name, id}
                haveFile, // check if the request has file attachment
                isTalking,
                res: res
            })
            
            return res.status(result.status).json({data: result.data, func: result.func})
        } catch (error) {
            return res.status(500).json({ error: error });
        }
   
    }
}


const askingAI = (dependencies) => {
    const { useCases: { 
        openAiUseCase: { askOpenAIUseCase },
        redisUseCase: { addToConversation, followUpConversation, popConversation }
    } } = dependencies;


    const execute = async (data) => {
        try {
            const { 
                prepareKey,
                promptRedis,
                prompt,
                maxToken,
                curUser,
                haveFile,
                isTalking=false,
                stream,
                res = null
            } = data

        let resource = ""
        // Check if the project run on Azure
        if(process.env.AZURE_OPENAI_API_KEY) {
            resource = "azure"
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
        const dataAskAI = {
            prompt,
            maxToken,
            curUser,
            conversation,
            prepareKey,
            haveFile,
            resource: resource,
            res: res,
            stream: stream,
            isTalking: isTalking,
        }
        const result = await askOpenAi.execute(dataAskAI)

        console.log("Request OPENAI status: ", `${result.status === 200 ? chalk.green.bold(`${result.status}`) : chalk.red.bold(`${result.status}`)}`)
        if(result.status === 200) {
            
            // add new response into redis
            const redisAddData = {
                role: "assistant",
                content: result.data,
                prepareKey: prepareKey
            }
            await redisAdd.execute(redisAddData)


            // return response
            let dataResponse = result.data

            if(result.image_list && result.image_list.length > 0) {
                dataResponse = result.image_list
            }

            console.log("Request OPENAI data: ", "{\n\tcontent: ", chalk.green.bold(`${dataResponse}`), "\n}")
            return {
                status: result.status,
                data: dataResponse,
                func: result.func
            }

        }
        else {
            throw Error(result.error)
        }
        } catch (error) {
            const redisPop = popConversation(dependencies)
            const redisPopData = {prepareKey: prepareKey}
            await redisPop.execute(redisPopData)
            console.log("Request OPENAI data: ", "{\n\terror: ", chalk.red.bold(`${error}`), "\n}")
        }
    }

    return { execute }
}

module.exports = { generateController, askingAI }