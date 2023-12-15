
const weatherService = require("../../../service/chatGpt/functionList/weather.func")

const weatherController = { 
    getWeatherInfo: async (req, res) => { 
        // call weather api
        const { q, lang="" } = req.query

       await weatherService.getByLocation(q, lang)
       .then(result => {
            if(result.status === 200) 
                return res.status(200).json({data: result.data})
       })
       .catch(err => {
           console.log(err)
           return res.status(500).json({ msg: err });
       }) 
    },
}

module.exports = weatherController 