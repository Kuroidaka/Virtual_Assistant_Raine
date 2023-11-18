const express = require('express')
const router = express.Router()
const weatherController = require('../controller/weather.controller')

router.post('/get_current', weatherController.getWeatherInfo)

module.exports = router