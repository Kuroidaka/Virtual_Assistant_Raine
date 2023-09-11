const chatgpt = require("./chatgpt.route")
const user = require("./user.route")

const routes = (app) => {
    app.use('/api/v1/chatgpt', chatgpt)
    app.use('/api/v1/user', user)

}

module.exports = routes