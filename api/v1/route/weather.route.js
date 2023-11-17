const express = require('express')
const router = express.Router()
const weather = require('../controller/weather.controller')

router.post('/get_current', weather.getWeatherInfo)

module.exports = router