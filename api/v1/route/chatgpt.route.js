const express = require('express')
const router = express.Router()
const chatgpt = require('../controller/chatgpt.controller')
const gettingServer = require("../middleware/serverInfor")

router.post('/ask', chatgpt.generate)
router.post('/ask-for-tts', chatgpt.generateForTTS)
router.post('/ask-for-func', chatgpt.askForFunction)
router.post('/trans', chatgpt.translate)
router.post('/image/ask', chatgpt.generateImg)
router.post('/image/edit', chatgpt.editImage)

module.exports = router