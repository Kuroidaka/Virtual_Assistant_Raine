
module.exports = (dependencies) => {

    const { openAi } = dependencies;

    const funcSpec = {
        name: "generate_image",
        description: "The function for generating new image or editing the existing when having the prompt of the review of the image, when user request portrait or wide image then use model dall-e-3",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                model: {
                    type: "string",
                    description: "Base on the complexity prompt to choose the proper model, if user request a complexity image description or need a high quality image then use model 'dall-e-3'. Always include this parameter in the request.",
                    enum: ["dall-e-3", "dall-e-2"],
                    default: "dall-e-2"
                },
                prompt: {
                    type: "string",
                    description: "The detailed image description, potentially modified to abide by the dalle policies. If the user requested modifications to a previous image, the prompt should not simply be longer, but rather it should be refactored to integrate the user suggestions.",
                },
                n: { 
                    type: "string", 
                    description: "The number of images to generate. If the user does not specify a number, generate 1 image. If the user specifies a number, generate that many images, up to a maximum of 5.",
                },
                quality:  {
                    type: "string",
                    description: "The quality of the requested image. With model dall-e-3 use 'high' if the user requests a high quality image, otherwise use 'standard'. Only use 'hd' with model dall-e-3",
                    enum: ["standard", "hd"],
                    default: "standard"
                },
                size: { 
                    type: "string", 
                    description: "The size of the requested image. With model dall-e-3 use 1792x1024 if the user requests a wide image, and 1024x1792 for full-body portraits. Always include this parameter in the request.",
                    default: "1024x1024"
                },
                style: {
                    type: "string",
                    description: "Only include this parameter with model dall-e-3. Use 'natural' if the user requests a natural style, otherwise use 'vivid'",
                    enum: ["natural", "vivid"],
                    default: "vivid"
                }
                
            },
            "required": ["model", "prompt"]
        },
    }

    const generate = async ({ model="dall-e-2", prompt, quality="standard", size="1024x1024", n, style }) => {

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

    const execute = async({args, conversation}) => {
        const { model, prompt, size, n, style } = args

        // take 1 image each request if the chain want to use dall-e-3
        let num = args.model === "dall-e-3" ? 1 : Number(n)
        const dalleData = { 
            model: model,
            prompt: prompt,
            quality: "standard",
            size: size,
            n: num,
            style: style
          }
  
          const imgList = []
          let content = ""
        try {
              if(args.model === "dall-e-3") {
                  let promises = [];
                  for(let i = 0; i < args.n; i++) {
                      promises.push(generate(dalleData));
                  }
      
                  //  begin trigger chain generate image
                  await Promise.all(promises).then(responses => {
                      responses.forEach((response, i) => {
                          if(response) {
                              const img = response.data[0];
                              imgList.push(img.url);
                              content += `Image ${i + 1}: ${img.revised_prompt ? img.revised_prompt : ""}\nURL: ${img.url}\n`;
                          } else {
                              conversation.push({
                                  role: "user",
                                  content: "Sorry, I can't generate any image"
                              });
                          }
                      });
                  }).catch(() => {
                      conversation.push({
                          role: "user",
                          content: `Sorry, I can't generate any image` 
                      });
                  });
                  //  end trigger chain generate image
                conversation.push({
                  role: "assistant",
                  content: content
                })
              }
              else {
                const response = await generate(dalleData)
      
                if(response) {
                  response.data.forEach((img, idx) => {
                    imgList.push(img.url)
                    content += `Image ${idx + 1}: ${img.revised_prompt ? img.revised_prompt: ""}\nURL: ${img.url}\n`
                  })
                  
                  conversation.push({
                    role: "assistant",
                    content: content
                  })
                }
                else {
                  conversation.push({
                    role: "user",
                    content: "Sorry, I can't generate any image"
                  })
                }
              }
        } catch (error) {
            console.log(error)
        }
        finally{
            return {
                conversation,
                content,
                imgList
            }
        }
    }

    return { 
        funcSpec,
        execute
    }
}

