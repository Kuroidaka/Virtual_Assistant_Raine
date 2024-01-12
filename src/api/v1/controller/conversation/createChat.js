
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

            if(!conID || conID === null || conID === undefined || conID === "" || conID == -1) { 
                callObj = {
                    temperature: 1,
                    max_tokens: 15,
                }
                const shortList = [
                    {
                        role: "user",
                        content: `generate a short title represent for a future conversation base on the following text:
                        --------
                        text: ${text}
                        --------`,
                    }
                ]
                
                completion = await azureOpenAi.getChatCompletions("GPT35TURBO16K", shortList, callObj);

                title = completion.choices[0].message.content


                // Create the conversation
                const conversation = await createConversation(dependencies).execute({
                    name: title,
                    from: from,
                });
                isNewConversation = true
                conID = conversation.id;
            }
            // Create the message
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

            return { message, title, isNewConversation };
        } catch (error) {
            throw new Error(error)
        }
   
    }

    return { execute }
}



module.exports = { createChatController, createConDB };