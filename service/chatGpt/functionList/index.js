const weatherFunc = require("./weather.func")
const taskFunc = require("./cron/task")

const taskFunction = new taskFunc()

module.exports = [weatherFunc.weatherFuncSpec, taskFunction.createReminderFuncSpec, taskFunction.listJobFuncSpec]