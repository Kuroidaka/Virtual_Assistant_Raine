const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file");
const { getFileExtension } = require("../../../../utils");

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { fileDB: { addFile } }
    } } = dependencies;


    const processDB = async (files) => {

        try {
            let promise = []
            files.forEach(file => {
                const { originalname:name, size } = file
                destinationPath = `./src/assets/tmpDocs/${name}`
                promise.push(addFile(dependencies).execute({ 
                    name: name,
                    path: destinationPath,
                    extension: getFileExtension(name),
                    size: size,
                }))
            })
            const resultDB = await Promise.all(promise)
    
            return { resultDB }
        } catch (error) {
            return { error: error }
        }
    }

    return async (req, res) => { 
       
            const docsPath = 'src/assets/tmpDocs';
            const files = req.files; // Retrieve the array of uploaded files
            let resource = ""

            // Check if the project run on Azure
            if(process.env.AZURE_OPENAI_API_KEY) {
                resource = "azure"
            }
            
            if (!files || files.length === 0) {
                return res.status(400).send('No file uploaded.');
            }
            console.log("files", files)

            const resultDB = await processDB(files)
            if(resultDB.resultDB){
                console.log(resultDB)
                if(resultDB.resultDB.find(file => file.isError === true)) {
                    return res.status(409).json({ error: "File have already exist or error occur" });
                }
            }
            else {
                return res.status(500).json({ error: resultDB.error });
            }



            await loadFileIntoVector({docsPath, resource});

            // if ({resultDB}) {
            //     const isNotEmpty = await isDirectoryEmpty(docsPath);
            //     if (isNotEmpty) {
            //     }
            // }


            return res.status(200).json({
                files
            })  
    }
}

