require("dotenv").config();
const axios = require("axios")
const { client, Collection, Events } = require("../../../../src/config/discord/bot.config") 
const chalk = require("chalk")
const { detectLan } = require("../../../../utils/index")
const DB = require("../../../../src/config/database/config.js")
const openai = require("../../../../src/config/openAI/index.js")
const RainePrompt = require("../../../../Raine_prompt_system.json")
const schedule = require('node-schedule');
const taskDBhandle = require("../../../database/task")
const { nanoid } = require('nanoid');

class reminderService {
  constructor() {
    this.list_job = {}
    this.createReminderFuncSpec = {
      "name": "create_reminder",
      "description": "Remind user to do something after a period of time or at a specific time, if user do not provide what to do, it will ask user to provide",
      "parameters": {
          "type": "object",
          "properties": {
              "what_to_do": {
                  "type": "string",
                  "description": "The task that user want to be reminded",
              },
              "period_time": {
                  "type": "string",
                  "description": `The a period of time that user want to remind, example if user want to be reminded after 1 hour, please take 1 hour, do not take the word 'after'`,
              },
              "specific_time": {
                  "type": "string",
                  "description": `The specific time that user want to remind, The specific time format is 0-23 if you want to be reminded tomorrow at 8 or 8:30, please take 'tomorrow:8:30'. the specific time can be something like 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)', when user want to be reminded at a specific time, please take the time in this format, the time will be converted to UTC time, the year time will be automatically set to ${new Date().getFullYear()}`,
              },
              
              "repeat": {
                  "type": "boolean",
                  "description": "repeating the reminder or not",
              }
          },
          "required": ["task", "time"],
      }
    }
    this.listJobFuncSpec = {
      "name": "list_reminder",
      "description": "List out all the reminders that user have been set",
      "parameters": {
          "type": "object",
          "properties": {},
      }
    }
    this.deleteReminderFuncSpec = {

    }
  }

  convertTime(time) {
    const minutesPattern = /\b(\d+)\s*(m|minutes|minute)\b/i;
    const hoursPattern = /\b(\d+)\s*(h|hours|hour)\b/i;
    const secondsPattern = /\b(\d+)\s*(s|seconds|second)\b/i;
    const daysPattern = /\b(\d+)\s*(d|days|day)\b/i;
    const monthsPattern = /\b(\d+)\s*(months|month|mo)\b/i;
    const tomorrowPattern = /^tomorrow:(\d{1,2})(?::(\d{2}))?$/
   
    if(secondsPattern.test(time)) {
        const seconds = `*/${time.match(secondsPattern)[1]} * * * * *`;
        return {
            time: seconds,
        };
    } else if(minutesPattern.test(time)) {
        const minutes = `*/${time.match(minutesPattern)[1]} * * * *`;
        return {
            time: minutes,
        };
    } else if(hoursPattern.test(time)) {
        const hours = `0 */${time.match(hoursPattern)[1]} * * *`;
        return {
            time: hours,
        };
    } else if(daysPattern.test(time)) {
        const days = `0 0 */${time.match(daysPattern)[1]} * *`;
        return {
            time: days,
        };
    } else if(monthsPattern.test(time)) {
      const months = `0 0 0 */${time.match(daysPattern)[1]} *`;
        return {
            time: months,
        };
    } else if(tomorrowPattern.test(time)) {
      const tomorrow = `0 ${time.match(tomorrowPattern)[2] ? time.match(tomorrowPattern)[2] : "0"} ${time.match(tomorrowPattern)[1]} */1 * *`;
      return {
            time: tomorrow,
        };
    }
    else {
        return {
            time: undefined,
            msg: 'This is not a measure of time'
        };
    }
  }

  async deleteJob(task) {
    if (this.list_job[task]) {
      this.list_job[task].cancel();
      delete this.list_job[task];
      console.log(`Job ${task} cancelled`);
    } else {
        console.log(chalk.red.bold(`Job ${task} not found`));
    }
  }

  async scheduleJobPromise (taskID, task, finalTime, repeat = false) {
    this.list_job[task] = schedule.scheduleJob(task, finalTime, async () => {
      try {
        const channelID = process.env.CHANNEL_CRON_ID
        const channel = client.channels.cache.get(channelID);
  
        if (channel) {
          console.log(chalk.green.bold("============= SET REMINDER ============="));
          const detectTaskLang = detectLan(task)
          console.log("Language detect from task", detectTaskLang )
          // advance response reminder
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: "system", content: RainePrompt[detectTaskLang].reminder },
              { role: "user", content: `This is what user want to be reminded: ${task}`},
            ],
            temperature: 1,
            max_tokens: 200,
          })
  
          const content = await completion.choices[0].message.content
          if(content) 
            channel.send(`
            >>> ## __Reminder:__ \n*${content}*`);
          if(!repeat){
            schedule.cancelJob(task);
            // delete job from database
            await Promise.all([taskDBhandle.deleteTask({id: taskID}), this.deleteJob(task)])
          }
          console.log(chalk.green.bold("============= END SET REMINDER ============="));
        }
      } catch (error) {
        throw(error);
      }
  });
  };

  async createJob(task, time, repeat = false) {
    const self = this;
    let finalTime
    const taskID = nanoid()
    const dataTask = {
        title: task,
        repeat: repeat,
        id: taskID
    }

    // process time
    console.log(chalk.green.bold("Cron is ready: "), time);
    if(!isNaN(Date.parse(time))) {
      finalTime = new Date(time)
      dataTask.specificTime = finalTime
    }
    else {
      dataTask.periodTime = time
      finalTime = self.convertTime(time).time
      if(finalTime === undefined) throw new Error("Time is not valid in create job function")
    }
    console.log("Cron time: ", chalk.green.bold(finalTime))
  
    // setup cron job
    try {

      // promise all to insert task into database and setup cron job
      const [idInserted] = await Promise.all([taskDBhandle.createTask(dataTask), this.scheduleJobPromise(taskID, task, finalTime, repeat)])
      console.log('Task ID Inserted:', idInserted);
      return ({status: 200, data: `Reminder set successful with ID: ${idInserted}`})
    } catch (error) {
      console.log(chalk.red.bold("[ERROR API]: ____REMINDER-SET-TIME___ "), error)
      return ({status: 500, error: `Reminder set failed. Error occur: ${error}`})
    }
  }
  
  async getCronJob() {
    
  }


}


module.exports = reminderService
