
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
    isTalk = false,
    model,
    prepareKey
  }) => {

    const instructions = RainePrompt()
    const {loyal:loyalPrompt, tools} = instructions
    let countSystem = 0
    const loyalSystem = { role: 'system', content: loyalPrompt }
    const systemTTS = { role: 'system', content: instructions.system_tts.instructions }



    // get current date
    const date = new Date()
    
    // check instructions
    if (instructions) {
      const dalle = { role: 'system', content: tools.dalle }
      const taskRemind = { role: 'system', content: tools.task.instructions }
      const readDocs = { role: 'system', content: tools.readDocs.instructions }

      conversation[0] = {
        role: 'system',
        content: `
          {Current time}: ${new Date()}
          Response to user by this language: ${lang}
          ${instructions.system.instructions}`,
      }
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

    // if user is talking with Raine
    if (isTalk) {
      conversation.push(systemTTS)
      ++countSystem
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
    // if (newFlag) {
    //   const conMerge = mergeConversation(dependencies)
    //   await conMerge.execute(prepareKey, conversation)
    // }

    // push final conversation
    conversation.push(newMsg)

    return {
      countSystem,
      conversation,
    }
  }

  return { execute }
}
