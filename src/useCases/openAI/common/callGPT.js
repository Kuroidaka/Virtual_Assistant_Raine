const checkValidToken = require('./checkValidToken')

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
    resource = ""
  }) => {
    let modelCountToken
    if (model === 'gpt-4-vision-preview') {
      modelCountToken = 'gpt-4'
    } else {
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
      await conMerge.execute(prepareKey, conversation)
    }

    let completion
    let callObj = {}

    if(resource === "azure") {
      const deploymentId = "GPT35TURBO16K"

      if (functionCall) {
        // Ask OpenAI function
        callObj = {
          temperature: temperature,
          max_tokens: maxToken,
          functions: listFunc,
          functionCall: 'auto',
        }
      } else {
        // Ask OpenAI
        callObj = {
          temperature: 1,
          max_tokens: maxToken,
        }
      }
      completion = await azureOpenAi.getChatCompletions(deploymentId, conversation, callObj);
    }
    else {
      if (functionCall) {
        // Ask OpenAI function
        callObj = {
          model: model,
          messages: conversation,
          temperature: temperature,
          max_tokens: maxToken,
          functions: listFunc,
          function_call: 'auto',
        }
      } else {
        // Ask OpenAI
        callObj = {
          model: model,
          messages: conversation,
          temperature: 1,
          max_tokens: maxToken,
        }
      }
      completion = await openAi.chat.completions.create(callObj)
    }

    // convert file content into string to prevent error when using other model gpt again
    if (model === 'gpt-4-vision-preview') {
      let lastMsg = conversation[conversation.length - 1];
      lastMsg.content = lastMsg.content[0].text;
      conversation.pop()
      conversation.push(lastMsg)


      // await mergeConversation(dependencies).execute(prepareKey, conversation)
    }

    conversation.push(completion.choices[0].message)
    return {
      conversation,
      completion,
    }
  }

  return { execute }
}
