const express = require('express')
const router = express.Router()
const user = require('../controller/user.controller')

router.post('/insert', user.insertUser)

module.exports = router