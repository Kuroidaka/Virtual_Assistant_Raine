const express = require('express')
const router = express.Router()
const chatgpt = require('../controller/chatgpt.controller')
const gettingServer = require("../middleware/serverInfor")

router.post('/ask', chatgpt.generate)

module.exports = router