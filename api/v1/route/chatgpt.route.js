const express = require('express')
const router = express.Router()
const chatgpt = require('../controller/chatgpt.controller')
const gettingServer = require("../middleware/serverInfor")

router.post('/ask', chatgpt.generate)
router.post('/image/ask', chatgpt.generateImg)

module.exports = router