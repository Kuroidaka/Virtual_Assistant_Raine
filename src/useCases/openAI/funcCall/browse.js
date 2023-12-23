const { serperCommon, scrapeCommon, sumCommon, callGPTCommon } = require("../common")
const dependencies = require("../../../config/dependencies")
const test = () => {

    const { openAi } = dependencies

    const funcSpec = {
        name: "web_browser",
        description: "The function for generating new image or editing the existing when having the prompt of the review of the image",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                model: {
                    type: "string",
                    description: "Base on the complexity prompt to choose the proper model, default model is 'dall-e-2' if user request a complexity image description or need a high quality image then use model 'dall-e-3' otherwise use 'dall-e-2'",
                    enum: ["dall-e-3", "dall-e-2"]
                },
                prompt: {
                    type: "string",
                    description: "The detailed image description, potentially modified to abide by the dalle policies. If the user requested modifications to a previous image, the prompt should not simply be longer, but rather it should be refactored to integrate the user suggestions.",
                },
                n: { 
                    type: "string", 
                    description: "The number of images to generate. If the user does not specify a number, generate 1 image. If the user specifies a number, generate that many images, up to a maximum of 5.",
                },
                size: { 
                    type: "string", 
                    description: "The size of the requested image. Use 1024x1024 (square) as the default, with model dall-e-3 use 1792x1024 if the user requests a wide image, and 1024x1792 for full-body portraits. Always include this parameter in the request."
                }
                
            },
        },
    }
    const systemPrompt = `
    You are a world class researcher, who can do detailed research on any topic and produce facts based results; you do not make things up, you will try as hard as possible to gather fact & data to back up the research

    Please make sure you complete the objective above with the following rules:
    1/  You should do enough research to gather as much information as possible about the objective
    2/ If there are url of relevant link & articles, you will scrape it to gather more information
    3/ After scraping & search, you should think "is there any new things i should searching & scraping based on the data I collected to increase research quality?"If answer is yes, continue; But don't do this more than 3 iterations
    4/ You should not make things up, you should only write facts & data that you have gathered
    5/ in the final output, you should include all reference data & links to back up your research
    `

    const execute = async  (q, objective) => {
        try {
        
            let conversation = []
            while(true) {
                completion = await openAi.chat.completions.create({
                    model: "gpt-4",
                    messages: conversation,
                    temperature: 0,
                })
                
            }

        } catch (error) {
            console.log(error)
            return error
            
        }
    }

    return { execute, funcSpec }
}

test().execute("home stay Đà lạt", "gợi ý các homestay ở Đà Lạt")