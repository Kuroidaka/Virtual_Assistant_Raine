const { nanoid } = require("nanoid");
const chalk = require("chalk")
module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

	const execute = async ({ 
        title,
        periodTime=null,
        specificTime=null,
        repeat,
        id=nanoid() 
    }) => {
        const taskData = {
            id: id,
            title: title,
            period_time: periodTime,
            specific_time: specificTime,
            repeat: repeat
        }
    
        const transaction = await DB.$transaction(async (prisma) => {
        try {
            const task = await prisma.task.create({
                data: taskData
            })
            console.log( chalk.blue("ADD TASK:"), task);
            return task.id
    
        } catch (error) {
            console.log(error)
            throw error
        }
        })
    
        return transaction;
      }

	return { execute };
};