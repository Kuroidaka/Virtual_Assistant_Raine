require("dotenv").config();
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const axios = require("axios")

const app = express()
const route = require("./api/v1/route/index");
const chalk = require("chalk");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors()) 
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.json())

route(app)

const port = process.env.SERVER_PORT || 8000; 



app.listen(port, () => {
    log("Server :", chalk.blue(port), chalk.green("connected"));
})

// const { Events, Collection } = require('discord.js');
const client = require("./config/discord/bot.config")
const { sliceString } = require("./service/discord/format/length"); 
const { log } = require("./config/log/log.config");


const TOKEN = process.env.DISCORD_BOT_TOKEN;

client.once('ready', async () => {
    log(`✨ ${client.user.tag} is ${chalk.green("online")}! ✨ `);
});

 

client.on('messageCreate', async message => {
    log(chalk.cyan("catch event"))
    if (message.author.bot || !message.guild) return;
    try {

        const { guildId } = message

        const guild = client.guilds.cache.get(guildId);
        const member = guild.members.cache.get(message.author.id);
        const user = member.user;
        const maxTokenEachScript = 2000 
        let substringToCheck = "hey raine";
        let botName = "raine"
            // Check the content of the message
        if (message.mentions?.users?.first()?.id === process.env.RAINE_ID 
        || message.content.toLowerCase().includes(substringToCheck.toLowerCase())
        || message.content.toLowerCase().includes(botName.toLowerCase())
        ) {
            message.channel.sendTyping()

            if(message.mentions?.users?.first() && message.mentions?.users?.first()?.id !== process.env.RAINE_ID) {

                message.content = message.content.replace(`<@${message.mentions?.users?.first()?.id}>`, message.mentions?.users?.first()?.username)
            }
            message.content.toLowerCase().includes(botName.toLowerCase()) || message.content.toLowerCase().includes(substringToCheck.toLowerCase()) ? message.content = message.content.replace(botName, "") : message.content = message.content.replace(substringToCheck, "")

            const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
            axios.post(`${originURL}/api/v1/chatgpt/ask`, {
                data: message,
                maxTokenEachScript: maxTokenEachScript,
                curUser: user
            })
            .then(res => {
                console.log(res.data.data.length)
                const newData = sliceString(res.data.data, maxTokenEachScript)
                message.channel.sendTyping()
                newData.map(msg => {
                    message.channel.send(msg)
                })
            })    
        } 
        
        // else if()
    } catch (error) {
        console.log(error)
    }
   

});

// Login to Discord with the bot's token
client.login(TOKEN);
