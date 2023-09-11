const cron = require('cron');
const GptService = require('../chatGpt/generate');

const sendCronMessage = (client, channel) => {
const job = new cron.CronJob('*/6 * * * *', async () => {

    // if (channel) {
    //   console.log("cron begin")
    //   const result = await GptService.ask(`
    //     show as a table list and have explain for each word with vietnamese and english 
        
    //     give me 5 advance english vocab for today

    //   `, null, 1000)
    //   channel.send(result.data.choices[0].message.content);
    // }
  });

  job.start();
}

module.exports = sendCronMessage;