const axios = require("axios")

module.exports = () => {

    // const funcSpec = {
    //     name: "search_google",
    //     description: "The function for generating new image or editing the existing when having the prompt of the review of the image, when user request portrait or wide image then use model dall-e-3",
    //     parameters: {
    //         type: "object",
    //         additionalProperties: false,
    //         properties: {
    //             q: {
    //                 type: "string",
    //                 description: "Base on the complexity prompt to choose the proper model, default model is 'dall-e-2' if user request a complexity image description or need a high quality image then use model 'dall-e-3' otherwise use 'dall-e-2'. Always include this parameter in the request.",
    //                 enum: ["dall-e-3", "dall-e-2"]
    //             }
                
    //         },
    //     },
    // }
    const execute = async (q) => {

        try {
            const myHeaders = {
                "X-API-KEY": "559ff02d37e645503da07cdb805a5dc1a2d4a23b",
                "Content-Type": "application/json"
            };
            
            const raw = {
                q: q
            };
              
    
            const requestOptions = {
                method: 'post',
                url: "https://google.serper.dev/search",
                headers: myHeaders,
                data: raw,
                followRedirect: true
            };
            
            const res = await axios(requestOptions)

            if(res.statusText = "OK") { 
                // console.log(res.data.knowledgeGraph)
                return res.data
            }

        } catch (error) {
            console.log(error)
            return error
        }
    }

    return { execute } 
}