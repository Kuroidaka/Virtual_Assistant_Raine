const { deleteFilesInDirectory, isDirectoryEmpty, deleteFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        openAiUseCase: { askOpenAIUseCase },
        redisUseCase: { addToConversation, followUpConversation, popConversation }
    } } = dependencies;

    return async (req, res) => { 
        const { data: { name }, type } = req.body;
        const docsPath = 'src/assets/tmpDocs';
        let resource = ""

        // Check if the project run on Azure
        if(process.env.AZURE_OPENAI_API_KEY) {
            resource = "azure"
        }

        if(type === "discord") {// if the request is from discord
            // Delete file from local
            if(name) {
                const isDeleted = await deleteFile(docsPath, name);
                if (isDeleted) {
                    const isNotEmpty = await isDirectoryEmpty(docsPath);
                    if (isNotEmpty) {
                        await loadFileIntoVector({docsPath, resource});
                    }
                }
            }
            else {
                deleteFilesInDirectory(docsPath)
            } 

        }
        try {
         
            return res.status(200).json({ data: "Deleted Successful" });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}