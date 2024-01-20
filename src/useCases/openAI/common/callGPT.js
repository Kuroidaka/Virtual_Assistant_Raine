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
      
    let completion
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

      let callObj = {}
  
      if(resource === "azure") {
  
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
        // let tmp = [{
        //   role: "user",
        //   content: [
        //     { type: 'text', text: 'what do you see from this image raine' },
        //     {
        //       type: 'image_url',
        //       image_url: {
        //         url: 'https://cdn.discordapp.com/attachments/1146752980599705681/1198222479118827592/img-NfVwvLMwnzIRl9DAvwqi05T8.png?ex=65be1ea4&is=65aba9a4&hm=df79db0a56dcb4de9dfd225ceebf6a02976285aa699d2ca985c870143ef250a2&'
        //       }
        //     }
        //   ]
        // }]
        completion = await azureOpenAi.getChatCompletions(model, conversation, callObj);
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
      if (model === 'gpt-4-vision-preview' || model ===  process.env.AZURE_OPENAI_API_GPT4_V) {
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
    } catch (error) {
        console.log(error)
        return { error, completion }
    }
  }

  return { execute }
}
