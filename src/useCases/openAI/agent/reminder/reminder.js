const createJob = require("./create_job")

module.exports = class reminderFunc {
  constructor(dependencies) {
    this.dependencies = dependencies
    this.funcSpec = {
      "name": "create_reminder",
      "description": "Useful for setup reminder for user, please follow the { Reminder's instruction } to setup reminder",
      "parameters": {
          "type": "object",
          "properties": {
              "remindPrompt": {
                  "type": "string",
                  "description": "The task that AI will remind the user about. This will be based on the user's prompt, and will be enhanced to provide a more engaging reminder and will attached with some icon relate to the task. For example, if the user says 'remind me to drink water...', the 'remindPrompt' could be 'Just a friendly reminder, it's time to drink some water. Stay hydrated!'"
              },
              "time": {
                  "type": "string",
                  "description": `
                  - The specific time that user want to remind. 
                  - The specific time must be in english
                  - The specific time format is like 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)', when user want to be reminded at a specific time, please take the time in this format, the year time will be automatically set to ${new Date().getFullYear()}
                  - If user request to remind after a period of time, please convert the time in this format 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)' base on the current time: ${new Date()}
                  `
              },
              
              "repeat": {
                  "type": "boolean",
                  "description": "repeating the reminder or not"
              }
          },
          "required": ["task", "time"]
      }
    }
  }
  
  async execute ({args, conversation}) {
    const { 
      remindPrompt,
      time,
      repeat
    } = args
       
    if(!remindPrompt) {
      conversation.push({
        role: "user",
        content: "user must provide what to do"
      })
    } else if(!time) {
      conversation.push({
        role: "user",
        content: "user must provide time"
      })
    } else {
      const result = await createJob(this.dependencies).execute({remindPrompt, time, repeat})
      if(result?.status === 500) {
        conversation.push({
          role: "assistant",
          content: `Error occur while trying to setup reminder, let user know about this bug in create_reminder function: ${result.error}`
        })
        throw new Error(result.error)
      }
      else {
        conversation.push({
          role: "assistant",
          content: result.data
        })
      }
    }
    return conversation
  }
}

