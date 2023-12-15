const weatherFunc = require("./weather.func")
const followUpImage = require("../../../useCases/openAI/funcCall/follow_up_image")
const taskFunc = require("./cron/task")

const taskFunction = new taskFunc()

module.exports = [weatherFunc.weatherFuncSpec, taskFunction.createReminderFuncSpec, taskFunction.listJobFuncSpec, followUpImage.followUpImageSpecFunc]