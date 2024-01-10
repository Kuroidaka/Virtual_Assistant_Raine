const axios = require("axios")
const { DynamicStructuredTool } = require("langchain/tools");
const { z } = require("zod")

module.exports = ({currentLang}) => {

    if(!currentLang) {
        currentLang = { 
            "lt": "en-US", 
            "cc": "us",
            "lc": "en"
        }
    }

    // Define scrapeWebsite Schema
    const googleSearchSchema = z.object({
        q: z.string(),
        lang: z.string(),
    });
    
    // Define tool
    class GoogleSearchTool extends DynamicStructuredTool {
        constructor() {
            super({
                name: "search",
                description:  `useful when you need to answer the questions about current events, data, you should ask targeted questions,
                The input for this tool contain 1 argument "q"
                "q" is the question that user want to know about the current events, data, news, ...
                The output will be a json string.`,
                func: async ({q}) => {
                    console.log("q:", q)
                    console.log("lang:", currentLang)
                    return execute({q, currentLang});
                },
                schema: googleSearchSchema,
            });
        }
    }

    const execute = async ({q, currentLang}) => {

        try {
            const myHeaders = {
                "X-API-KEY": "559ff02d37e645503da07cdb805a5dc1a2d4a23b",
                "Content-Type": "application/json"
            };
            
            const raw = {
                q: q,
                gl: currentLang.cc,
                hl: currentLang.lc,
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
                return JSON.stringify(res.data)
            }

        } catch (error) {
            console.log(error)
            return error
        }
    }

    return { execute, GoogleSearchTool } 
}