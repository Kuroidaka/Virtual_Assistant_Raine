const checkValidToken = require('./checkValidToken')
const callGPT = require('./requestGpt')

module.exports = (dependencies) => {
  const { 
    useCases: { 
      redisUseCase: { mergeConversation }
    },
    openAi,
    azureOpenAi
  } = dependencies;

  if (!mergeConversation) {
		throw new Error("mergeConversation should be exist in dependencies");
	}
  
  const execute = async ({
    model,
    temperature,
    conversation,
    maxToken,
    systemMsgCount,
    prepareKey,
    functionCall = false,
    listFunc = () => {},
    resource = "",
    stream = false,
    res = null
  }) => {
      
    try {
      let modelCountToken
      if (model === 'gpt-4-vision-preview' || model === process.env.AZURE_OPENAI_API_GPT4_V) {
        modelCountToken = 'gpt-4'
      } else if (model === process.env.AZURE_OPENAI_API_GPT35) {
        modelCountToken = "gpt-3.5-turbo"
      }
      else {
        modelCountToken = model
      }
  
      const tokenCheckData = {
        conversation: conversation,
        countSystem: systemMsgCount,
        model: modelCountToken,
      }
      const { newFlag, conversation: newConversation } = await checkValidToken().execute(tokenCheckData)
      conversation = newConversation
      if (newFlag) {
        const conMerge = mergeConversation(dependencies)
        await conMerge.execute(prepareKey, conversation, systemMsgCount)
      }
  
      const { conversation:newCon, completion } = await callGPT(dependencies).execute({
          model,
          temperature,
          conversation,
          maxToken,
          functionCall,
          listFunc,
          resource,
          stream,
          res
      })

      console.log(completion)
      conversation = newCon
  
      // convert file content into string to prevent error when using other model gpt again
      if (model === 'gpt-4-vision-preview' || model ===  process.env.AZURE_OPENAI_API_GPT4_V) {
        let lastMsg = conversation[conversation.length - 2];
        lastMsg.content = lastMsg.content[0].text;
        // await mergeConversation(dependencies).execute(prepareKey, conversation)
      }
      
      return {
        conversation,
        completion,
      }
    } catch (error) {
        console.log(error)
        return { error }
    }
  }

  return { execute }
}
