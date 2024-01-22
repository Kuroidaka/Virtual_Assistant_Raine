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
    functionCall=false,
    listFunc=() => {},
    resource="",
    stream=false,
    res=null
  }) => {
      
    try {
        // Set common properties of callObj
        let callObj = {
            temperature: functionCall ? temperature : 1,
            max_tokens: maxToken,
        };
        let completion
        let responseContent = ""

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
            if(stream) {
              callObj.stream = stream;
              completion = await openAi.chat.completions.create(callObj, { responseType: 'stream' });

              let funcCall = {
                "name": null,
                "arguments": "",
              };

              let newCompletion ={ choices: [] }

              for await (let chunk of completion) {
                  let delta = chunk.choices[0].delta;
                  if ('function_call' in delta) {
                      if ('name' in delta.function_call) {
                          funcCall.name = delta.function_call.name;
                      }
                      if ('arguments' in delta.function_call) {
                          funcCall.arguments += delta.function_call.arguments;
                      }
                  }
                  if (chunk.choices[0].finish_reason === 'function_call') {
                    newCompletion.choices[0] = {
                          "message": {
                            "function_call": funcCall,
                            "role": "assistant",
                            "content": null,
                          },
                          "finish_reason": "function_call",
                    }
                    completion = newCompletion

                    // res.write function console.log(funcCall.name)
                    res.write(JSON.stringify(funcCall))
                    res.write("\n\n")
                  }
                  else if(chunk.choices[0].finish_reason === 'stop') {
                    newCompletion = {
                      choices: [
                        {
                          "message": {
                            "role": "assistant",
                            "content": responseContent,
                          },
                          "finish_reason": "stop",
                        }
                      ]
                    }
                    completion = newCompletion
                    res.write("\n\n");
                  }
                  if (!delta.content) {
                      continue;
                  }

                  responseContent += delta.content
                  res.write(delta.content);

                  // Log Terminal
                  // console.clear()
                  // console.log(responseContent)
              }
            }
            else {
                completion = await openAi.chat.completions.create(callObj);
            }
        }
    
        conversation.push(completion.choices[0].message)
        // conversation.push(objectContent)
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
