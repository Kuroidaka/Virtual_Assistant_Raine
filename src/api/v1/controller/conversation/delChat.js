const { getFileExtension, downloadFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            delConversation
         } }
    } } = dependencies;

    return async (req, res) => { 
        const { data: { conversationId, from } } = req.body;
        
        try {            
            const message = await delConversation(dependencies).execute({
                conversationId: conversationId,
                from: from
            });

            return res.status(200).json({ data: JSON.stringify(message) });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}