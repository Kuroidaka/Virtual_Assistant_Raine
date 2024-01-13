const { getFileExtension, downloadFile } = require("../../../../../utils");
const loadFileIntoVector = require("../../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { fileDB: { addFile } }
    } } = dependencies;


    const processDB = async (files) => {
        let promise = []
        files.forEach(file => {
            const { name, url, size } = file
            destinationPath = `./src/assets/tmpDocs/${name}`
            promise.push(addFile(dependencies).execute({ 
                name: name,
                path: destinationPath,
                extension: getFileExtension(name),
                size: size,
                url: url
            }))
        })
        const result = await Promise.all(promise)

        return result
    }

    const storeFile = async ({files, type, docsPath, resource}) => {
        if(type === "discord") {// if the request is from discord
            // Download file to local
            const promise = []
            files.forEach(file => {
                const { name, url } = file
                destinationPath = `./src/assets/tmpDocs/${name}`
                promise.push(downloadFile(url, destinationPath))
            })
            await Promise.all(promise)
            
            // Load docs into vector store
            await loadFileIntoVector({docsPath, resource})

            // deleteFilesInDirectory(docsPath)
        }
    }
    return async (req, res) => { 
        const { data: { files }, type } = req.body;
        const docsPath = 'src/assets/tmpDocs';
        let resource = ""

        // Check if the project run on Azure
        if(process.env.AZURE_OPENAI_API_KEY) {
            resource = "azure"
        }
        
        try {     

            const resultDB = await processDB(files)// Process with database
            
            if(resultDB.find(file => file.isError)) {
                return res.status(200).json({ error: "File have already exist or error occur" });
            }

            await storeFile({files, type, docsPath, resource})// Store file
            
            return res.status(200).json({ data: JSON.stringify(resultDB)});
        } catch (error) {
            return res.status(500).json({ error: error });
        }
   
    }
}