const DB = require('../../config/database/config.js')
const chalk = require('chalk')
const log = console.log
const { nanoid } = require('nanoid');

const taskDBhandle = {
  createTask: async (req) => {
    const { title, periodTime=null, specificTime=null, repeat, id=nanoid() } = req 
    log('create task')

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
        log( chalk.blue("ADD TASK:"), task);
        return task.id

    } catch (error) {
        log(error)
        throw error
    }
    })

    return transaction;
  },
  getTask: async (req) => {
    const { id } = req
    log('get task')

    const transaction = await DB.$transaction(async (prisma) => {
    try {
        let task
        if(id === "") {
            task = await prisma.task.findMany()
        }else {
            task = await prisma.task.findUnique({
                where: {
                    id: id
                },
            })
        }
        log( chalk.green("GET TASK:"), task);

    } catch (error) {
        log(error)
        throw error
    }
    })

    return transaction;
  },
  deleteTask: async(req) => {
    const { id } = req
    log('delete task')

    const transaction = await DB.$transaction(async (prisma) => {
    try {
        const task = await prisma.task.delete({
            where: {
                id: id
            },
        })
        log( chalk.red("DELETED TASK:"), task);
    } catch (error) {
        log(error)
        throw error
    }
    })

    return transaction;
  }
}

module.exports = taskDBhandle 


// taskDBhandle.createTask({
//     title: "Team meeting",
//     specificTime: "2023-03-11T10:00:00",
//     repeat: true
// })

// taskDBhandle.getTask({id: ""})

// taskDBhandle.deleteTask({id: 7})