const axios = require("axios")
const RainePrompt = require("../../../Raine_prompt_system.json")
const log = require("../../../config/log/log.config")

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
        .then(res => {
          const newData = res.data
          const raineWeatherPrompt = RainePrompt[lang].weather

          if(newData) {
            const data = {
              content: `
              ${raineWeatherPrompt}: 
              ${JSON.stringify(newData)}
              `,
              role: "user"
            }

            console.log("Weather prompt:", data)

            return {
              have_content: true,
              data: data
            }
          } else {
            return {
              have_content: false,
              data: null
            }
          }
        })
        .catch(err => {
          console.log(err)
          return {
            have_content: false,
            data: {
              content: `Error Occur: ${err}`,
            }
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
