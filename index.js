require("dotenv").config();
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const axios = require("axios")

const app = express()
const route = require("./api/v1/route/index")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors()) 
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.json())

route(app)

const port = process.env.SERVER_PORT || 8000; 



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// const { Events, Collection } = require('discord.js');
const client = require("./config/discord/bot.config")
const userCommand = require("./service/discord/command/user")
const { sliceString } = require("./service/discord/format/length") 
// const fs = require('fs');

// Your bot token (get this from the Discord Developer Portal)
const TOKEN = process.env.DISCORD_BOT_TOKEN;


// client.commands = new Collection();
// // const commandFiles = fs.readdirSync('./service/discord/command').filter(file => file.endsWith('.js'));

// // for (const file of commandFiles) {
// // 	const command = require(`./service/discord/command/${file}`);
// // 	client.commands.set(command.data.name, command);
// // }


client.once('ready', async () => {
    console.log('Bot is online!', client.user.tag );
    // for (const guild of client.guilds.cache.values()) {
    //     await guild.commands.set([...client.commands.values()].map(command => command.data));
    // }
});

 

client.on('messageCreate', message => {
    console.log("catch event")
    if (message.author.bot || !message.guild) return;
    try {
            // Check the content of the message
        if (message.content[0] === "+") {
            message.channel.sendTyping()
            const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
            axios.post(`${originURL}/api/v1/chatgpt/ask`, {
                prompt: message.content
            })
            .then(res => {
                console.log(res.data.data.length)
                const newData = sliceString(res.data.data, 400)
                newData.map(msg => {
                    message.channel.send(msg)
                })
            })

        }
        else if(message.content[0] === "!") {
            // const [CMD_NAME, ...args] = message.content
            //     .trim()
            //     .substring(1)
            //     .split(/\s+/);
            // console.log(CMD_NAME, args)
            userCommand.execute(message)
        }
    } catch (error) {
        console.log(error)
    }
   

});

// Login to Discord with the bot's token
client.login(TOKEN);
