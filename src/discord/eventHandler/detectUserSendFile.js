
module.exports = (dependencies) => {

    const { useCases: {
        redisUseCase: { addToConversation }
    } } = dependencies;

    const imgExtension = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp', '.heic', '.heif']

    const execute = ({interaction}) => {
        if(interaction.attachments.size > 0) {
            let prepareKey = interaction.channelId
            let isValidSendImgFile = false
            // user attached files
            let filePrompt = "This is the file user attached: \n"				
            for (const [key, value] of interaction.attachments) {
                let fileName = value.name;
                let lastDotPosition = fileName.lastIndexOf(".");
                let fileExtension = fileName.substring(lastDotPosition + 1);
                let fileURL = value.url

                // check if file is image
                let isImgFile = imgExtension.indexOf(`.${fileExtension}`) !== -1
                if(isImgFile) {
                    filePrompt += `File[${key}]\n\t- Type:${fileExtension}\n\t- Link: ${fileURL}\n`
                    isValidSendImgFile = true
                }
            }

            if(isValidSendImgFile) {
                console.log(filePrompt)
                // add file prompt into redis
                const data = {
                    role: "user",
                    content: filePrompt,
                    prepareKey: prepareKey
                }
                addToConversation(dependencies).execute(data)
            }
        }
    }

    return { execute }
}