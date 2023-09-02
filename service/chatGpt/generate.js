const openai = require("../../config/openAI")
const redisService = require("../redis/redis.service")

const GptService = {
  ask: async (promptContent, originalPrompt, maxTokenEachScript) => {
    try {
      console.log("prompt", promptContent);

      const role = "assistant"
      const content = promptContent

      redisService.addToConversation(role, originalPrompt)

      const completion = await openai.chat.completions.create({
        // model: 'text-davinci-003',
        messages: [{ role: role, content: content }],
        model: "gpt-3.5-turbo",
        temperature: 0.6,
        max_tokens: maxTokenEachScript
      });
  
      const generatedResponse = completion.choices[0].message.content
  
      return ({ status: 200, data: generatedResponse })
    } catch(error) {
      console.log(error)
      return ({status: 500, error: error})
      // Consider adjusting the error handling logic for your use case
      // if (error.response) {
      //   console.error(
      //     // error.response.status,
      //      error.response.data);
      //   return ({
      //     // status: error.response.status,
      //     error: error.response.data,
      //   })
      // } else {
      //   console.error(`Error with OpenAI API request: ${error.message}`);
      //   return ({
      //     status: 500,
      //     error: {
      //       message: 'An error occurred during your request.',
      //     }
      //   })
      // }
    }

  }  
}


module.exports = GptService