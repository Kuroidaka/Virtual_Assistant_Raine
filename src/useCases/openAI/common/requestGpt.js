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
    functionCall = false,
    listFunc = () => {},
    resource = ""
  }) => {
      
    try {
        // Set common properties of callObj
        let callObj = {
            temperature: functionCall ? temperature : 1,
            max_tokens: maxToken,
        };
        let completion
        // Add specific properties based on resource and functionCall
        if (resource === "azure") {
            if (functionCall) {
                callObj.functions = listFunc;
                callObj.functionCall = 'auto';
            }
            completion = await azureOpenAi.getChatCompletions(model, conversation, callObj);
        } else {
            callObj.model = model;
            callObj.messages = conversation;
            if (functionCall) {
                callObj.functions = listFunc;
                callObj.function_call = 'auto';
            }
            completion = await openAi.chat.completions.create(callObj);
        }
    
        conversation.push(completion.choices[0].message)
        return {
            conversation,
            completion,
        }
    } catch (error) {
        console.log(error)
        throw error
    }
  }

  return { execute }
}
