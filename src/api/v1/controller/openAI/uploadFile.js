const { deleteFilesInDirectory, downloadFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        openAiUseCase: { askOpenAIUseCase },
        redisUseCase: { addToConversation, followUpConversation, popConversation }
    } } = dependencies;

    return async (req, res) => { 
        const { data: { files }, type } = req.body;
        const docsPath = 'src/assets/tmpDocs';
        let resource = ""

        // Check if the project run on Azure
        if(process.env.AZURE_OPENAI_API_KEY) {
            resource = "azure"
        }

        if(type === "discord") {// if the request is from discord
            // Download file to local
            const promise = []
            files.forEach(file => {
                const { name, extension, url, size } = file
                destinationPath = `./src/assets/tmpDocs/${name}`
                promise.push(downloadFile(url, destinationPath))
            })
            await Promise.all(promise)

            // Load docs into vector store
            await loadFileIntoVector({docsPath, resource})

            deleteFilesInDirectory(docsPath)

        }
        try {
         
            return res.status(200).json({ data: JSON.stringify(files) });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}