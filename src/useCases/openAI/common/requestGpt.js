module.exports = (dependencies) => {
  const {
    useCases: {
      redisUseCase: { mergeConversation },
    },
    openAi,
    azureOpenAi,
  } = dependencies

  if (!mergeConversation) {
    throw new Error('mergeConversation should be exist in dependencies')
  }

  const validateObject = ({ data, azure, openAI, type, reason }) => {
    if (type === 'openai') {
      data[openAI] = reason
    } else {
      data[azure] = reason
    }

    return data
  }

  const processStream = async ({ res, completion, type }) => {
    let funcCall = {
      name: null,
      arguments: '',
    }

    let newCompletion = { choices: [] }
    let responseContent = ''

    for await (let chunk of completion) {
      let delta = chunk.choices[0]?.delta
      if (!delta) {
        continue
      }
      if ('functionCall' in delta || 'function_call' in delta) {
        let functionCall = delta.functionCall || delta.function_call
        if ('name' in functionCall) {
          funcCall.name = functionCall.name
        }
        if ('arguments' in functionCall) {
          funcCall.arguments += functionCall.arguments
        }
      }

      if (
        chunk.choices[0].finish_reason === 'function_call' ||
        chunk.choices[0].finishReason === 'function_call'
      ) {
        newCompletion.choices[0] = {
          message: {
            role: 'assistant',
            content: null,
          },
        }
        newCompletion.choices[0] = validateObject({
          data: newCompletion.choices[0],
          azure: 'finishReason',
          openAI: 'finish_reason',
          type: type,
          reason: 'function_call',
        })

        newCompletion.choices[0].message = validateObject({
          data: newCompletion.choices[0].message,
          azure: 'functionCall',
          openAI: 'function_call',
          type: type,
          reason: funcCall,
        })

        res.write(JSON.stringify(funcCall))
        res.write('\n\n')
        break
      } else if (
        chunk.choices[0]?.finishReason === 'stop' ||
        chunk.choices[0]?.finish_reason === 'stop' ||
        chunk.choices[0]?.finishDetails?.type === 'stop' ||
        chunk.choices[0]?.finish_details?.type === 'stop'
      ) {
        newCompletion = {
          choices: [
            {
              message: {
                role: 'assistant',
                content: responseContent,
              },
            },
          ],
        }
        newCompletion.choices[0] = validateObject({
          data: newCompletion.choices[0],
          azure: 'finishReason',
          openAI: 'finish_reason',
          type: type,
          reason: 'stop',
        })

        res.write('\n\n')
        break
      } else if (
        chunk.choices[0]?.finishReason === 'length' ||
        chunk.choices[0]?.finish_reason === 'length'
      ) {
        newCompletion = {
          choices: [
            {
              message: {
                role: 'assistant',
                content:
                  responseContent +
                  '\n Stopped due to maximum length of token.',
              },
            },
          ],
        }
        newCompletion.choices[0] = validateObject({
          data: newCompletion.choices[0],
          azure: 'finishReason',
          openAI: 'finish_reason',
          type: type,
          reason: 'length',
        })

        res.write('\n Stopped due to maximum length of token.')

        break
      }

      if (!delta.content) {
        continue
      }

      responseContent += delta.content
      res.write(delta.content)
    }

    if (newCompletion.choices.length > 0) {
      return newCompletion
    } else {
      console.log('error occur cause choices length is 0')
      res.end()
    }
  }

  const streamOpenAIResponse = async ({ res, callObj }) => {
    callObj.stream = true
    let completion = await openAi.chat.completions.create(callObj, {
      responseType: 'stream',
    })
    return await processStream({ res, completion, type: 'openai' })
  }

  const streamAzureResponse = async ({ res, callObj, model, conversation }) => {
    callObj.stream = true
    let completion = await azureOpenAi.streamChatCompletions(
      model,
      conversation,
      callObj,
    )
    return await processStream({ res, completion, type: 'azure' })
  }

  const execute = async ({
    model,
    temperature,
    conversation,
    maxToken,
    functionCall = false,
    listFunc = () => {},
    resource = '',
    stream = false,
    res = null,
  }) => {
    try {
      // Set common properties of callObj
      let callObj = {
        temperature: functionCall ? temperature : 1,
        max_tokens: maxToken,
      }
      let completion

      // Add specific properties based on resource and functionCall
      if (resource === 'azure') {
        if (functionCall) {
          callObj.functions = listFunc
          callObj.functionCall = 'auto'
        }
        if (stream) {
          completion = await streamAzureResponse({
            res,
            callObj,
            model,
            conversation,
          })
        } else {
          completion = await azureOpenAi.getChatCompletions(
            model,
            conversation,
            callObj,
          )
        }
      } else {
        callObj.model = model
        callObj.messages = conversation
        if (functionCall) {
          callObj.functions = listFunc
          callObj.function_call = 'auto'
        }
        if (stream) {
          completion = await streamOpenAIResponse({ res, callObj })
        } else {
          completion = await openAi.chat.completions.create(callObj)
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
