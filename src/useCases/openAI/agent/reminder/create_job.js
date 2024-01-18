const schedule = require('node-schedule');
const chalk = require("chalk")
const { nanoid } = require('nanoid');

const deleteJob = require("./delete_job")
const cronSchedule = require("./cron_schedule")
const printDiscord = require("./discord_print")

module.exports = (dependencies) => {

  const {
    useCases: {
      DBUseCase: {
        taskDB
      },
    }    
  } = dependencies

  const scheduleJobPromise = ({taskID, remindPrompt, finalTime, repeat = false}) => {

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

  const execute = async ({remindPrompt, time, repeat = false}) => {
    const taskID = nanoid();
    let finalTime;

    // Create task data
    const dataTask = {
        title: remindPrompt,
        repeat,
        id: taskID,
    };

    // Process time
    if (!isNaN(Date.parse(time))) {
        finalTime = new Date(time);
        // minus 1 second due to the delay in sending message process
        finalTime.setSeconds(finalTime.getSeconds() - 1)

        dataTask.time = finalTime;
    }
  
    // setup cron job
    try {
      const { addTask } = taskDB;
      const createTask = addTask(dependencies);
      

      // Promise all to insert task into database and setup cron job
      const [idInserted] = await Promise.all([createTask.execute(dataTask), cronSchedule(dependencies).execute({taskID, remindPrompt, finalTime, repeat})]);

      return ({ status: 200, data: `Reminder set successful with ID: ${idInserted}` });
    } catch (error) {
      return ({ status: 500, error: `--Reminder set failed---. Error occur: ${error}` });
    }
  }

  return { execute }
}
  