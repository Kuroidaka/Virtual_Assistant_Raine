const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
        } },
        redisUseCase: { updateKeyforConversation }
    } } = dependencies;

    return async (req, res) => { 
        const { 
                conversationId,
                from,
                text,
                sender,
                senderID,
                maxToken,
                isAttachedFile=false,
                imgFiles=[],
                isTalk=false

            } = req.query;
        
  
        try {            
            let prompt = text
            let promptRedis = text
            let haveFile = {
                img: false,
                docs: isAttachedFile
            }
            // const emitSSE= (res, id, data) =>{
            //     res.write('id: ' + id + '\n');
            //     res.write("data: " + data + '\n\n');
            //   }

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            // const id = (new Date()).toLocaleTimeString();
            // // Sends a SSE every 3 seconds on a single connection.
            // setInterval(function() {
            // emitSSE(res, id, (new Date()).toLocaleTimeString());
            // }, 3000);
        
            // emitSSE(res, id, (new Date()).toLocaleTimeString());

            if(imgFiles.length > 0) {// prepare prompt data for file image attachment
                prompt = [{
                    type: "text",
                    text: prompt
                }]

                imgFiles.forEach(file => {
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
                    imageList: imgFiles
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
                    isTask: isTalk, // false
                    stream: true,
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

                // store AI response to DB
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