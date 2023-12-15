const checkValidToken = require('./checkValidToken')

module.exports = (dependencies) => {
  const { 
    useCases: { 
      redisUseCase: { mergeConversation }
    },
    openAi
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
    lan = 'default',
    functionCall = false,
    listFunc = () => {},
  }) => {
    let flagCheckOverToken = false
    let modelCountToken
    if (model === 'gpt-4-vision-preview') {
      modelCountToken = 'gpt-4'
    } else {
      modelCountToken = model
    }

    const tokenCheckData = {
      flagCheckOverToken: flagCheckOverToken,
      conversation: conversation,
      countSystem: systemMsgCount,
      model: modelCountToken,
    }
    const { newFlag, conversation: newConversation } = await checkValidToken().execute(tokenCheckData)
    conversation = newConversation
    if (newFlag) {
      const conMerge = mergeConversation(dependencies)
      await conMerge.execute(prepareKey, lan, conversation)
    }

    let completion

    if (functionCall) {
      // Ask OpenAI function
      completion = await openAi.chat.completions.create({
        model: model,
        messages: conversation,
        // model: "gpt-3.5-turbo",
        temperature: temperature,
        max_tokens: maxToken,
        functions: listFunc,
        function_call: 'auto',
      })
    } else {
      // Ask OpenAI
      completion = await openAi.chat.completions.create({
        model: model,
        messages: conversation,
        temperature: 1,
        max_tokens: maxToken,
      })
    }

    conversation.push(completion.choices[0].message)
    return {
      conversation,
      completion,
    }
  }

  return { execute }
}
