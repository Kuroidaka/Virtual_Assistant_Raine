const { fileDirToUrl } = require('../../../../utils');

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
         } }
    } } = dependencies;

    return async (req, res) => { 
        const { data } = req.body;
        
        try {            
            let directoryPath = 'src/assets/img';
            const imgList = await fileDirToUrl(dependencies).execute({ directoryPath })
            return res.status(200).json({ data: imgList });

        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}