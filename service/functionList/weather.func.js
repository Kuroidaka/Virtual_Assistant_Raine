const axios = require("axios")

const weatherService = {
    getByLocation: async (q, lang="") => {

		// call weather api
        const weatherURL = process.env.WEATHER_ORIGIN_URL
        const weatherAPIKEY = process.env.WEATHER_API_KEY

        return await axios({
            method: 'post',
            url: `${weatherURL}/current.json`,
            params: {
                q: q,
                key: weatherAPIKEY,
                lang: lang
            },
            headers: {
            'Content-Type': 'application/json'
            }
        })
    },
    weatherFuncSpec: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. Ho Chi Minh",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      }
}

module.exports = weatherService
