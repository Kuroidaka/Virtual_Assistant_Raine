
const createChatController = (dependencies) => {
    return async (req, res) => { 
        const { data } = req.body;
        
        try {            
            await createConDB(dependencies).execute(data)
            return res.status(200).json({ data: "created message successfully" });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}

const createConDB = (dependencies) => {
    const { 
        useCases: { 
            DBUseCase: { conversationDB: { 
                createConversation,
                createMessage,
                updateLastMsgCon
            } }
        },
        openAi,
        azureOpenAi,
    } = dependencies;

    const execute = async (data) => {
        try {
            const { 
                conversationId,
                from,
                text,
                sender,
                senderID
            } = data

            let isNewConversation = false
            let title = ""
            let conID = conversationId
            let resource = ''

            if(process.env.AZURE_OPENAI_API_KEY) {
                resource = "azure"
            }

            if(!conID || conID === null || conID === undefined || conID === "" || conID == -1) { 

                const shortList = [
                    {
                        role: "user",
                        content: `Summarize the following text in less than 5 words:
                        --------
                        text: ${text}
                        --------`,
                    }
                ]
                if(resource === "azure") {
                    callObj = {
                        temperature: 1,
                        max_tokens: 15,
                    }
                    completion = await azureOpenAi.getChatCompletions("GPT35TURBO16K", shortList, callObj);
                }
                else {
                    callObj = {
                        model: "gpt-4",
                        messages: shortList,
                        temperature: 1,
                        max_tokens: 15,
                      }
                    completion = await openAi.chat.completions.create(callObj)
                }

                title = completion.choices[0].message.content


                // Create the conversation
                const conversation = await createConversation(dependencies).execute({
                    name: title,
                    from: from,
                });
                isNewConversation = true
                conID = conversation.id;
            }
            // Create the message in DB
            const message = await createMessage(dependencies).execute({
                conversationId: conID,
                text: text,
                sender: sender,
                senderID: senderID
            });
        
            // Update the last message of the conversation
            await updateLastMsgCon(dependencies).execute({
                conversationId: conID,
                lastMessage: text,
                lastMessageAt: message.createdAt
            })

            return { message, title, isNewConversation, conversationId: conID };
        } catch (error) {
            throw new Error(error)
        }
   
    }

    return { execute }
}



module.exports = { createChatController, createConDB };