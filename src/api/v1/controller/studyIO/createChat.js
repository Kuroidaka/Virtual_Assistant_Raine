const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");


module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
        } },
        redisUseCase: { updateKeyforConversation }
    } } = dependencies;

    const checkValidData = (str) => {
        try {
            if(JSON.parse(str)) {
                return JSON.parse(str)
            }
        } catch (error) {
            return false
        }
    }

    return async (req, res) => { 
        const { 
                conversationId,
                from,
                text,
                sender,
                senderID,
                maxToken,
                isAttachedFile=false,
                imgFiles="",
                isTalking=false,
                stream=false
            } = req.query;
        console.log("query data", req.query)
  
        try {            
            let prompt = text
            let promptRedis = text
            let haveFile = {
                img: false,
                docs: isAttachedFile
            }
            let newImgFiles = []

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // check data type of imgFiles is valid for array type
            const isValidDataImg = checkValidData(imgFiles)
            if(isValidDataImg) {
                newImgFiles = isValidDataImg

                if(Array.isArray(newImgFiles) && newImgFiles.length > 0 ) {// prepare prompt data for file image attachment
                    prompt = [{
                        type: "text",
                        text: prompt
                    }]
    
                    newImgFiles.forEach(file => {
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

            let conID = conversationId ? conversationId : "-1"

            const storeDBFunc = createConDB(dependencies)

            const askAIFunc = askingAI(dependencies)

            const [storeDB, askAI] = await Promise.all([
                storeDBFunc.execute({ // store user message to DB
                    conversationId: conID,
                    from,
                    text: text,
                    sender,
                    senderID,
                    imageList: newImgFiles
                }),
                askAIFunc.execute({ // ask AI
                    prepareKey: conID, // conversation key
                    promptRedis: promptRedis, // prompt for redis,
                    prompt: prompt, // prompt for openAI
                    maxToken: Number(maxToken), 
                    curUser: {
                        name: sender,
                        id: senderID
                    }, //{name, id}
                    haveFile: haveFile, // check if the request has file attachment
                    isTalking: (isTalking === "true" || isTalking === true) ? true : false, // false
                    stream: stream,
                    res: res // for streaming
                })
            ])

            // update prepareKey for redis if this request is new conversation
            if(conID === "-1") {
                conID = storeDB.message.conversationId
                await updateKeyforConversation(dependencies).execute({
                    prepareKey: "-1",
                    newKeyUpdate: conID
                })
            }


            let storeAiDBList = []
            if(Array.isArray(askAI.data)) { // Image response
                const promise = []
                // store AI response(img) to DB
                askAI.data.forEach((msg) => {

                    promise.push(createConDB(dependencies).execute({
                        conversationId: storeDB.message.conversationId,
                        from,
                        text: msg,
                        sender: "bot",
                        senderID: "-2"
                    }))
                })

                const newStoreList = await Promise.all(promise)
                storeAiDBList = newStoreList.map(store => store.message)


            } else {

                // store AI response tostreamAzureResponse DB
                const storeAIDB = await createConDB(dependencies).execute({
                    conversationId: storeDB.message.conversationId,
                    from,
                    text: askAI.data,
                    sender: "bot",
                    senderID: "-2"
                })
                storeAiDBList[0] = storeAIDB.message
            }


            // get the whole conversation
            const newConversation = await getConversations(dependencies).execute({ from: "StudyIO", id: storeDB.message.conversationId })

            res.write("__FIN__")
            res.write(JSON.stringify({
                data: {
                    bot: storeAiDBList,
                    user: storeDB.message,
                    title: storeDB.title,
                    newConversation: newConversation,
                    isNewConversation: storeDB.isNewConversation
                },
                func: askAI.func
            }));
            res.end();
        } catch (error) {
            // return res.status(500).json({ error: error });
            console.log(error)
            res.end() 
        }
   
    }
}