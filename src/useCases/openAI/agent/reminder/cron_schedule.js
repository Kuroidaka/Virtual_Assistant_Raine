const schedule = require('node-schedule');
const chalk = require("chalk")

const deleteJob = require("./delete_job")
const printDiscord = require("./discord_print")

module.exports = (dependencies) => {


  const calculateFutureTime = (time, intervalInMinutes) => {
    // Convert the initial time and current time to minutes
    let initialTimeInMinutes = time.getHours() * 60 + time.getMinutes();
    let currentTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    // Calculate how many intervals have passed since the initial time
    let intervalsPassed = Math.floor((currentTimeInMinutes - initialTimeInMinutes) / intervalInMinutes);

    // Calculate the next reminder time in minutes
    let nextReminderTimeInMinutes = (intervalsPassed + 1) * intervalInMinutes + initialTimeInMinutes;

    // Create a new Date object for the next reminder time
    let nextReminderTime = new Date();
    nextReminderTime.setHours(Math.floor(nextReminderTimeInMinutes / 60));
    nextReminderTime.setMinutes(nextReminderTimeInMinutes % 60);

    // Ensure the next reminder time is in the future
    if (nextReminderTime <= new Date()) {
        nextReminderTimeInMinutes += intervalInMinutes;
        nextReminderTime.setHours(Math.floor(nextReminderTimeInMinutes / 60));
        nextReminderTime.setMinutes(nextReminderTimeInMinutes % 60);
    }

    return nextReminderTime;
}

// Usage:
let initialTime = new Date(); // Initial time
let interval = 5; // Interval in minutes
let futureTime = calculateFutureTime(initialTime, interval);
console.log(`Next reminder time is: ${futureTime}`);

  const execute = ({taskID, remindPrompt, finalTime, repeat = false, reminderInterval, cronTime}) => {

    if (schedule.scheduledJobs[taskID]) {
      return;
    }

    let scheduleTime;
    if(repeat){
      if(cronTime) {
        scheduleTime = cronTime;
      }
      else if(reminderInterval) {
        scheduleTime = calculateFutureTime(new Date(finalTime), reminderInterval);
      }
    }
    else {
      scheduleTime = finalTime;
    }
    console.log("final time: ", scheduleTime)
    schedule.scheduleJob(taskID, scheduleTime, async () => {
      console.log(chalk.green.bold("============= SET REMINDER ============="));
      try {
        // send reminder to discord
        printDiscord(dependencies).execute({remindPrompt});

        /*
          Send reminder notification in other platform
        */
       
        if (!repeat) {
          await deleteJob(dependencies).execute({taskID})
        }
        else {
          // let scheduleTime = calculateFutureTime(new Date(finalTime), reminderInterval);
          // schedule.rescheduleJob(taskID, scheduleTime);

        
        }
      } catch (error) {
        console.error(error);
      }

      console.log(chalk.green.bold('============= END SET REMINDER ============='));
    });
    
  };

  return { execute }
}