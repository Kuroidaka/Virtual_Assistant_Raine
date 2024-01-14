const createConDB = (dependencies) => {
    const { 
        useCases: { 
            DBUseCase: { conversationDB: { 
                createConversation,
            } }
        }
    } = dependencies;

    const execute = async (from) => {
        try {



            // Create the conversation
            const conversation = await createConversation(dependencies).execute({
                name: '',
                from: from,
            });

            return { conversation: conversation };

        } catch (error) {
            throw new Error(error)
        }
    }

    return { execute }
}


const createConversationController = (dependencies) => {
    return async (req, res) => { 
        const { from } = req.body;
        try {            
            const { conversation } = await createConDB(dependencies).execute(from)
            return res.status(200).json({ data: {
                conversation: conversation
            } });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}


module.exports = { createConversationController }