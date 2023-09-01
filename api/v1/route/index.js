const chatgpt = require("./chatgpt")

const routes = (app) => {
    app.use('/api/v1/chatgpt', chatgpt)

}

module.exports = routes