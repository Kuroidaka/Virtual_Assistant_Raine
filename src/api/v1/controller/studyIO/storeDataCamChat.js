const { createConDB } = require("../conversation/createChat");
const { askingAI } = require("../openAI/ask/generate");


module.exports = (dependencies) => {
    const { useCases: { 
        redisUseCase: { addToConversation, followUpConversation,  }
    } } = dependencies;


    return  async (req, res) => { 
        try {            
     
            const { prompt } = req.body
            // add new prompt into redis
            console.log("prompt", prompt)

            if(prompt === undefined || prompt === null || prompt === "") {
                return res.status(400).json({ data: "No input prompt" });
            }
            const redisAdd = addToConversation(dependencies)
            const redisAddData = {
                role: "user",
                content: prompt,
                prepareKey: "cam"
            }
            await redisAdd.execute(redisAddData)

            // // get the conversation from redis
            // const redisFollowUp = followUpConversation(dependencies)
            // const conversation = await redisFollowUp.execute({prepareKey: "cam"})
             

            return res.status(200).json({ data: "success" });
            // return { data: conversation }
        } catch (error) {
            return res.status(500).json({ error: error });
        }
   
    }

}
