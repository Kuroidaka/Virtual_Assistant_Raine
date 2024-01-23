
const RainePrompt = require("../../../assets/Raine_prompt_system.js")
const checkValidToken = require('./checkValidToken')

module.exports = (dependencies) => {

  const { 
    useCases: { 
      redisUseCase: { mergeConversation }
    }
  } = dependencies;


  const execute = async ({
    conversation,
    redisConversation,
    userPrompt,
    curUser,
    lang,
    isTalking = false,
    model,
    prepareKey
  }) => {

    const instructions = RainePrompt({lang})
    const {loyal:loyalPrompt, tools} = instructions
    let countSystem = 0
    const systemTTS = { role: 'system', content: instructions.system_tts.instructions }

    // if user is talking with Raine
    if (isTalking) {
      conversation[0] = systemTTS
      countSystem++
    } else {
      const loyalSystem = { role: 'system', content: loyalPrompt }
      const system = { role: 'system', content: instructions.system.instructions }  
      // check instructions
      if (instructions) {
        const dalle = { role: 'system', content: tools.dalle }
        const taskRemind = { role: 'system', content: tools.task.instructions }
        const readDocs = { role: 'system', content: tools.readDocs.instructions }
  
        conversation[0] = system
        conversation.push(dalle)
        conversation.push(taskRemind)
        conversation.push(readDocs)
        countSystem +=4
      }
      // check user boss on Discord
      if (curUser) {
        const userResponse = {
          role: 'system',
          content: `You know who you are talking to, and this is the person's name talking to you: ${curUser.name}`,
        }
  
        if (curUser.id === process.env.OWNER_ID) {
          conversation.push(loyalSystem)
          ++countSystem
        }
  
        conversation.push(userResponse)
        ++countSystem
      }
    }
    
    // prepare data for conversation
    const newMsg = { role: 'user', content: userPrompt }
    if (redisConversation && redisConversation.length > 0) {
      conversation = [...conversation, ...redisConversation]
    }

    // check token length before push into chat history
    const tokenCheckData = {
      conversation: conversation,
      countSystem: countSystem,
      model: model,
    }
    const { newFlag, conversation: newConversation } = await checkValidToken().execute(tokenCheckData)
    conversation = newConversation
    if (newFlag) {
      const conMerge = mergeConversation(dependencies)
      await conMerge.execute(prepareKey, conversation, countSystem)
    }

    // push final conversation
    conversation.push(newMsg)

    return {
      countSystem,
      conversation,
    }
  }

  return { execute }
}
