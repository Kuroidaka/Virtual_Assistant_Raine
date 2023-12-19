
module.exports = (dependencies) => {

    const { openAi } = dependencies;

    const funcSpec = {
        name: "generate_image",
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
    const execute = async ({ model="dall-e-2", prompt, quality="standard", size="1024x1024", n, style = "vivid" }) => {

        response = await openAi.images.generate({
            model: model,
            prompt: prompt,
            size: size,
            quality: quality,
            n: Number(n),
            style: style
        })
        
        console.log("image_url", response)
        return response
    }

    return { 
        funcSpec,
        execute
    }
}

