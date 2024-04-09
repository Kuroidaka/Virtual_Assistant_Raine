const { deleteFilesInDirectory, isDirectoryEmpty, deleteFile } = require("../../../../../utils");
const loadFileIntoVector = require("../../../../../useCases/openAI/agent/read_file/faiss_index/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { fileDB: { delFile } }
    } } = dependencies;

    const processDB = async (name) => {
        await delFile(dependencies).execute({ 
            name: name
        })
    }

    const deleteFileFromLocal = async ({ name, docsPath, resource }) => {
        // Delete file from local
        if(name) {
            const isDeleted = await deleteFile(docsPath, name);
            if (isDeleted) {
                const isNotEmpty = await isDirectoryEmpty(docsPath);
                if (isNotEmpty) {
                    await loadFileIntoVector({docsPath, resource});
                } else {
                    deleteFilesInDirectory("src/assets/vector")
                
                }
            }
        }
        else {
            deleteFilesInDirectory(docsPath)
        } 
    }

    return async (req, res) => { 
        const { data: { name } } = req.body;
        const docsPath = 'src/assets/tmpDocs';
        let resource = ""

        // Check if the project run on Azure
        if(process.env.AZURE_OPENAI_API) {
            resource = "azure"
        }

        try {
            
            await Promise.all([
                deleteFileFromLocal({ name, docsPath, resource }),// Delete file
                processDB(name)// Process with database
            ])
            return res.status(200).json({ data: "Deleted Successful" });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}