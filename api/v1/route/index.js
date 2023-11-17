const chatgpt = require("./chatgpt.route")
const user = require("./user.route")
const weather = require("./weather.route")

const routes = (app) => {
    app.use('/api/v1/chatgpt', chatgpt)
    app.use('/api/v1/user', user)
    app.use('/api/v1/weather', weather)

}

module.exports = routes