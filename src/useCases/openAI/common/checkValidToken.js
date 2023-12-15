const { countToken } = require("../../../utils");
const chalk = require("chalk")

module.exports = () => {
  const execute = async ({
    flagCheckOverToken,
    conversation,
    countSystem,
    model,
  }) => {
    // check token length

    let condition = true
    let numTokens = countToken(JSON.stringify(conversation), model)
    let numTokensBefore = numTokens

    while (condition) {
      const numTokens = countToken(JSON.stringify(conversation), model)
      console.log(chalk.yellow.bold('Token: '), numTokens)
      if (numTokens >= 6000) {
        flagCheckOverToken = true
        conversation.splice(countSystem, 2)
      } else condition = false
    }
    numTokens = countToken(JSON.stringify(conversation), model)

    console.log(chalk.blue.bold('ConversationPrompt'), conversation)
    if (flagCheckOverToken) {
      console.log(chalk.yellow.bold('Token before: '), numTokensBefore)
      console.log(chalk.yellow.bold('Token after: '), numTokens)
    }

    return {
      newFlag: flagCheckOverToken,
      conversation,
    }
  }

  return { execute }
}
