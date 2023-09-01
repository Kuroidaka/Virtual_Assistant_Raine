const express = require('express')
const router = express.Router()
const chatgpt = require('../controller/chatgpt.controller')

router.post('/ask', chatgpt.generate)

module.exports = router