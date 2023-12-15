const generateController = require("./generate")


module.exports = (dependencies) => {
    return {
        generateController: generateController(dependencies)
    }
}