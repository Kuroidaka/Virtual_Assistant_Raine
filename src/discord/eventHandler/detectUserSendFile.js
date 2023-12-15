
module.exports = (dependencies) => {

    const { useCases: {
        redisUseCase: { addToConversation }
    } } = dependencies;

    const execute = ({interaction}) => {
        if(interaction.attachments.size > 0) {
            let prepareKey = interaction.channelId

            // user attached files
            let filePrompt = "This is the file user attached: \n"				
            for (const [key, value] of interaction.attachments) {
                filePrompt += `\tFile[${key}] Link: ${value.url}\n`
            }
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

    return { execute }
}