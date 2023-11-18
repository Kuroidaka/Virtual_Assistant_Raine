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
    }
}

module.exports = weatherService
