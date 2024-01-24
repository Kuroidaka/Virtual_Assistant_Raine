const { getFileExtension, downloadFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/faiss_index/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            delConversation
         } },
        redisUseCase: { clearConversation }
    } } = dependencies;

    return async (req, res) => { 
        const { data: { conversationId, from } } = req.body;
        
        try {            
            const message = await delConversation(dependencies).execute({
                conversationId: conversationId,
                from: from
            });

            const isSuccesed = await clearConversation(dependencies).execute({prepareKey: conversationId})
            if(!isSuccesed) {
                throw new Error("Clear conversation failed")
            }

            return res.status(200).json({ data: JSON.stringify(message) });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}