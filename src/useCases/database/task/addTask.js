const { nanoid } = require("nanoid");
const chalk = require("chalk")
const moment = require('moment-timezone');

module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

	const execute = async ({ 
        title,
        time,
        repeat,
        id=nanoid() 
    }) => {

        time = moment(time).tz('Asia/Bangkok').format()
        const taskData = {
            id: id,
            title: title,
            time: time,
            repeat: repeat
        }
        
        console.log("moment(time).tz('Asia/Bangkok').format(),", moment(time).tz('Asia/Bangkok').format(),)

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