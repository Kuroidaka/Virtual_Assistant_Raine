
const followUpImage = {
    process: async () => {
   
    },
    funcSpec: {
    name: "follow_up_image_in_chat",
    description: `
        - When user ask something about the image or images which user have provided to you before from the messages, you will get the the images url into a array from a string like this
        "{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"content\":\"raine what is this image\"},{\"type\":\"image_url\",\"image_url\":{\"url\":\"https://cdn.discordapp.com/attachments/1146752980599705681/1184158611912523796/image.jpg?ex=658af4a5&is=65787fa5&hm=467057200cedc959cf76ba329679b872f1207ab18eb8581803d8abf48ec0bfa3&\"}}]}
        "
        - You can get the specific image url by using the index of the array
    `,
    parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
            "prompt": {
                "type": "string",
                "description": "the prompt about what user ask about the image and want you to describe it",
            },
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
            }
        },
        required: ["image_list"]
    }
}
}

module.exports = followUpImage












