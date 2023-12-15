const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");

module.exports = {
	data: {
		name: 'face',
		check: (interaction) => {
			let substringToCheck = "-face";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			interaction.channel.sendTyping()

            interaction.content = interaction.content.replace("-face", "")
            const url = "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9ufGVufDB8fDB8fHww&w=1000&q=80"

            const originURL = process.env.ORIGIN_URL || "http://127.0.0.1:8000"
            const response = await axios.post(`http://127.0.0.1:8000/file/face-detect/url`,
                {
                    url: url,
                },
                { 
                    responseType: 'stream'
                }
            )
            console.log(response.data)

            const writer = fs.createWriteStream('temp.jpg');
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
              }).then(() => {
                interaction.channel.send({
                  files: [{
                    attachment: './temp.jpg',
                    name: 'face-detection.jpg'
                  }]
                }).then(() =>{
                    fs.unlink('temp.jpg', err => {
                        if (err) throw err;
                        console.log('Temp file deleted!');
                    });
                    })
                })

            // if(interaction.attachments.each.length > 0) {
            //     interaction.attachments.each(file => {
                   
            //     })
            // }  
		
		} catch (error) {
			console.error(error)
		}
	},
};

