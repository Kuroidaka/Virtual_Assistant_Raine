const schedule = require('node-schedule');
const chalk = require("chalk")

const deleteJob = require("./delete_job")
const printDiscord = require("./discord_print")

module.exports = (dependencies) => {

  const execute = ({taskID, remindPrompt, finalTime, repeat = false}) => {

    if (schedule.scheduledJobs[taskID]) {
      return;
    }

    schedule.scheduleJob(taskID, finalTime, async () => {
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
      } catch (error) {
        console.error(error);
      }

      console.log(chalk.green.bold('============= END SET REMINDER ============='));
    });
    
  };


  return { execute }
}
  