
const RainePrompt = require("../../../assets/Raine_prompt_system.js")

module.exports = () => {
  const execute = async ({
    conversation,
    oldConversation,
    userPrompt,
    curUser,
    lang,
    isTalk = false,
  }) => {

    const instructions = RainePrompt()
    const {loyal:loyalPrompt, tools} = instructions
    let countSystem = 0
    let loyalSystem = { role: 'system', content: loyalPrompt }
    let systemTTS = { role: 'system', content: instructions.system_tts.instructions }
    let taskRemind = { role: 'system', content: tools.task.instructions }
    let dalle = { role: 'system', content: tools.dalle }

    const date = new Date()
    const currentDate =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()

    if (instructions) {
      conversation[0] = {
        role: 'system',
        content: `
          Current date: ${currentDate}
          Response to user by this language: ${lang}
          ${instructions.system.instructions}`,
      }
      conversation.push(dalle)

      countSystem +=2
    }

    conversation.push(taskRemind)
    countSystem++

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



    if (isTalk) {
      conversation.push(systemTTS)
      ++countSystem
    }

    // prepare data for conversation
    const newMsg = { role: 'user', content: userPrompt }
    if (oldConversation && oldConversation.length > 0) {
      conversation = [...conversation, ...oldConversation]
    }
    conversation.push(newMsg)

    return {
      countSystem,
      conversation,
    }
  }

  return { execute }
}
