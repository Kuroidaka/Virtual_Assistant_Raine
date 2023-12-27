const schedule = require('node-schedule');
const chalk = require("chalk")

module.exports = (dependencies) => {

  const {
    useCases: {
      DBUseCase: {
        taskDB
      },
    }    
  } = dependencies

  const execute = async ({taskID}) => {
    console.log("Current Cron Job: ", Object.keys(schedule.scheduledJobs))
    if (Object.keys(schedule.scheduledJobs).indexOf(taskID) === -1) {
      console.log(chalk.red.bold(`Job ${taskID} not found`));
      return;
    }

    const { deleteTask } = taskDB;
    const deleteTaskDB = deleteTask(dependencies)

    await Promise.all([
      deleteTaskDB.execute({ id: taskID }), // Delete task from database
      schedule.scheduledJobs[taskID].cancel(), // Delete task from cron job
    ]);

    console.log(`Job ${taskID} cancelled`);
  }
  return { execute }
}
  