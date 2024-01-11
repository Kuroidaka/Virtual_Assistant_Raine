const { getFileExtension, downloadFile } = require("../../../../utils");
const loadFileIntoVector = require("../../../../useCases/openAI/agent/read_file/load_file")

module.exports = (dependencies) => {
    const { useCases: { 
        DBUseCase: { conversationDB: { 
            getConversations
         } }
    } } = dependencies;

    return async (req, res) => { 
        const { data } = req.body;
        
  
        try {
            // Get all conversations from the database
           const data = await getConversations(dependencies).execute()
           
            // Prepare the sidebar list
            const conversationData = [
                { dayRef: "Today", conversationList: [] },
                { dayRef: "Yesterday", conversationList: [] },
                { dayRef: "Previous 7 days", conversationList: [] },
                { dayRef: "Previous", conversationList: [] },
            ];

            // Iterate over each conversation
            for (let conversation of data) {

                // Determine which dayRef the conversation belongs to
                const now = new Date();
                const lastMessageAt = new Date(conversation.lastMessageAt);
                const diffInDays = Math.floor((now - lastMessageAt) / (1000 * 60 * 60 * 24));

                let dayRef;
                if (diffInDays === 0) dayRef = "Today";
                else if (diffInDays === 1) dayRef = "Yesterday";
                else if (diffInDays <= 7) dayRef = "Previous 7 days";
                else dayRef = "Previous"

                // Add the conversation to the appropriate dayRef in the sidebar list
                const dayRefObj = conversationData.find(item => item.dayRef === dayRef);
                dayRefObj.conversationList.push(conversation);
            }

            return res.status(200).json({ data: conversationData });
        } catch (error) {
         
            return res.status(500).json({ error: error });
        }
   
    }
}