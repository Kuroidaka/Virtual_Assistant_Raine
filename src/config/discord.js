
const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

module.exports = {
  client,
  Collection, 
  Events 
}

