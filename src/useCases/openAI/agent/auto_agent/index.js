const { spawn } = require('child_process');

const test = () => {

    // const { openAi } = dependencies;

    // const funcSpec = {
    //     name: "generate_image",
    //     description: "The function for generating new image or editing the existing when having the prompt of the review of the image, when user request portrait or wide image then use model dall-e-3",
    //     parameters: {
    //         type: "object",
    //         additionalProperties: false,
    //         properties: {
    //             model: {
    //                 type: "string",
    //                 description: "Base on the complexity prompt to choose the proper model, default model is 'dall-e-2' if user request a complexity image description or need a high quality image then use model 'dall-e-3' otherwise use 'dall-e-2'. Always include this parameter in the request.",
    //                 enum: ["dall-e-3", "dall-e-2"]
    //             },
    //             prompt: {
    //                 type: "string",
    //                 description: "The detailed image description, potentially modified to abide by the dalle policies. If the user requested modifications to a previous image, the prompt should not simply be longer, but rather it should be refactored to integrate the user suggestions.",
    //             },
    //             n: { 
    //                 type: "string", 
    //                 description: "The number of images to generate. If the user does not specify a number, generate 1 image. If the user specifies a number, generate that many images, up to a maximum of 5.",
    //             },
    //             quality:  {
    //                 type: "string",
    //                 description: "The quality of the requested image. Use 'standard' as the default, with model dall-e-3 use 'high' if the user requests a high quality image, otherwise use 'standard'. Only use 'hd' with model dall-e-3",
    //                 enum: ["standard", "hd"]
    //             },
    //             size: { 
    //                 type: "string", 
    //                 description: "The size of the requested image. Use 1024x1024 (square) as the default, with model dall-e-3 use 1792x1024 if the user requests a wide image, and 1024x1792 for full-body portraits. Always include this parameter in the request."
    //             },
    //             style: {
    //                 type: "string",
    //                 description: "The style of the requested image default is 'vivid'. Only include this parameter with model dall-e-3. Use 'natural' if the user requests a natural style, otherwise use 'vivid'",
    //                 enum: ["natural", "vivid"]
    //             }
                
    //         },
    //     },
    // }

    const execute = async({args, conversation}) => {
        const { prompt } = args
        let python = spawn('python', ['src/useCases/openAI/agent/auto_agent/index.py', prompt ]);

        // Write to the child p1rocess's stdin
        python.stdin.write('Your input here\n');

        python.stdout.on('data', (data) => {
            console.log(`print out: ${data}`);
        });
        
        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        python.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    return { 
        // funcSpec,
        execute
    }
}

// test().execute({args: {
//     prompt: "build a basic & simple website for a small business using html, css, javascript only and run it on a local server"
// }})
