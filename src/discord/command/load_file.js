const axios = require('axios');

module.exports = {
	data: {
		name: 'load-file',
		check: (interaction) => {
			let substringToCheck = "-load";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

            if(interaction.attachments.size > 0) {
                let listFile = []
                // process file Input
                for (const [key, value] of interaction.attachments) {
                    let fileName = value.name;
                    let fileURL = value.url
                    let fileSize = value.size
                    const fileObject = {
                        name: fileName,
                        url: fileURL,
                        size: fileSize
                    }
                    listFile.push(fileObject)
                }

                const originURL = process.env.ORIGIN_URL || `http://localhost:${process.env.SERVER_PORT}`
                axios.post(`${originURL}/api/v1/openai/upload-file`, {
                    data: {
                        files: listFile
                    },
                    type: "discord"
                })
                .then(res => {

                    if(res.statusText === "OK"){
                        interaction.channel.send(res.data.data)
                    }
                })
            } else {
                interaction.channel.send("Please upload a file to load")
            }
			
		} catch (error) {
			console.log(error)
		}
	},
};