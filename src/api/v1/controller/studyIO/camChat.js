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
                text,
                sender,
                senderID,
                maxToken,
                imgFiles="",
            } = req.query;
        console.log("query data", req.query)
  
        try {            
            let prompt = text
            let promptRedis = text
            let haveFile = {
                img: false,
                docs: false
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


            const askAIFunc = askingAI(dependencies)

            await askAIFunc.execute({ // ask AI
                prepareKey: "cam", // conversation key
                promptRedis: promptRedis, // prompt for redis,
                prompt: prompt, // prompt for openAI
                maxToken: Number(maxToken), 
                curUser: {
                    name: sender,
                    id: senderID
                }, //{name, id}
                haveFile: haveFile, // check if the request has file attachment
                isTalking: true, 
                stream: true,
                res: res // for streaming
            })

            res.write("__CAM_FIN__")
            res.end();
        } catch (error) {
            // return res.status(500).json({ error: error });
            console.log(error)
            res.end() 
        }
   
    }
}