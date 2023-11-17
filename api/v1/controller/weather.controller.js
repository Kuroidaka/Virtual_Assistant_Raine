const axios = require("axios")

const weather = { 
    getWeatherInfo: async (req, res) => { 
        try {
            // call weather api
            const weatherURL = process.env.WEATHER_ORIGIN_URL
            const weatherAPIKEY = process.env.WEATHER_API_KEY
            const { q, lang="" } = req.query

            axios({
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
			.then(result => {
				return res.status(200).json({data: result.data})
			}).
            catch(err => {
                console.log(err)
                return res.status(500).json({ msg: err });
            })

        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Server Error' });
        }

    },
}

module.exports = weather 