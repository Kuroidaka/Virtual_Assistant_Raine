const { getFileExtension, downloadFile } = require("../../../../../utils");
const loadFileIntoVector = require("../../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { fileDB: { getFile } }
    } } = dependencies;


   
    return async (req, res) => { 
        // const { } = req.body;
    
        try {            
            const file = await getFile(dependencies).execute()
            
            return res.status(200).json({ data: file });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}