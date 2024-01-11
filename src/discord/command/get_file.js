const axios = require('axios');

module.exports = {
	data: {
		name: 'get-file',
		check: (interaction) => {
			let substringToCheck = "-file";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

            const originURL = process.env.ORIGIN_URL || `http://localhost:${process.env.SERVER_PORT}`
			await axios.get(`${originURL}/api/v1/openai/get-file`)
            .then(res => {

                if(res.statusText === "OK"){
                    interaction.channel.send(res.data.data)
                }
            })
            .catch(error => {
                console.log(error.data)
            })

		} catch (error) {
			console.log(error)
		}
	},
};