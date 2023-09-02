const gettingServer = async (req, res, next) => {

    try {
        

        next()
    } catch (error) {
        return res.status(500).json({ error: "Middleware" + error });
    }

}
module.exports = gettingServer