const common = require("../common")
const chalk = require("chalk")

const followUpImage = {
    execute: async ({args, conversation, dependencies, countSystem, prepareKey}) => {
        const { prompt, image_list } = args

        let content = []

        // remove the function call msg from conversation because model gpt-4-vision-preview doesn't support function call
        conversation.pop()

        if(image_list && image_list.length > 0) {
          content = [{type: "text", text: prompt}]
          image_list.forEach(img => content.push({
            type: "image_url",
            image_url: {
              "url": img.url,
            },
          }))
            conversation.push({
                role: "user",
                content: content
            })
        }
        else { //still not reach llm, fix later
            conversation.push({
                role: "assistant",
                content: "not found any image"
          })
        }
        
        const callGpt = common.callGPTCommon(dependencies)
        const gptData = {
          model: "gpt-4-vision-preview",
          temperature: 0,
          conversation: conversation,
          maxToken: 2000,
          systemMsgCount: countSystem,
          prepareKey: prepareKey,
          functionCall: false
        }
        const { conversation:newConversation, completion } = await callGpt.execute(gptData)
      
        console.log(chalk.blue.bold("Response for asking about image:"), completion.choices[0]);
       
        return {
            conversation: newConversation,
            content: completion.choices[0].message.content
        }
    },
    funcSpec: {
        name: "follow_up_image_in_chat",
        description: `
            - When user ask something about the image or images which user have provided to you before from the messages, you will get the the images url into a array from a string like this
            "{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"content\":\"raine what is this image\"},{\"type\":\"image_url\",\"image_url\":{\"url\":\"https://cdn.discordapp.com/attachments/1146752980599705681/1184158611912523796/image.jpg?ex=658af4a5&is=65787fa5&hm=467057200cedc959cf76ba329679b872f1207ab18eb8581803d8abf48ec0bfa3&\"}}]}
            "
            - You can get the specific image url by using the index of the array
            - Response to user by the language that user requested
            - remember to put the comma between the properties in argument
        `,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                "image_list": {
                    "type": "array",
                    "description": "the list of image url from the conversation list, containing the first image url from the conversation list or the second image url base on user prompt",
                    "items": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "the url of the image from the conversation list",
                            },
                        }
                    },         
                },
                "prompt": {
                    "type": "string",
                    "description": "Detailed Description about the image or images or what user want to know about the image",
                },
            },
            required: ["image_list"]
        }
    }
}

module.exports = followUpImage












