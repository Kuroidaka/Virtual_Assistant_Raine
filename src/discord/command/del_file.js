const axios = require('axios');

module.exports = {
	data: {
		name: 'del-file',
		check: (interaction) => {
			let substringToCheck = "-del";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

            const fileName = interaction.content.split("-del ")[1]

            if(fileName) {
                const originURL = process.env.ORIGIN_URL || `http://localhost:${process.env.SERVER_PORT}`
                axios.post(`${originURL}/api/v1/openai/del-file`, {
                    data: {
                        name: fileName
                    },
                    type: "discord"
                })
                .then(res => {
    
                    if(res.statusText === "OK"){
                        interaction.channel.send(res.data.data)
                    }
                })
            }
            else {
                interaction.channel.send("Please select a file to delete")
            }			
		} catch (error) {
			console.log(error)
		}
	},
};