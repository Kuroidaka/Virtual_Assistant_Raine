const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const chalk = require("chalk")
const bodyParser = require('body-parser')

const initDCBot = require("./discord") 
const tools = require("./tool")
const test = require("../test")

const app = express()

const API_PREFIX = "/api/v1"
const PORT = process.env.SERVER_PORT 

async function checkDatabaseConnection(DB) {
	try {
		await DB.$connect()
		console.log('Database Connected')
	} catch (error) {
		console.error('Error connecting to the database: ', error)
	} finally {
		await DB.$disconnect()
	}
  }

module.exports = {
	start: async () => {
		
		// Middlewares
		app.use(express.json())
		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({extended: true}))
		app.use(cors()) 
		app.use(cookieParser())
		app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
		const dependencies = require("./config/dependencies")

		const runList = []

		// init discord bot
		runList.push(initDCBot(dependencies))

		// Run tools
		runList.push(tools(dependencies))

		await Promise.all(runList)

		// Routes
		const routes = require("./api/v1/route")
		app.use(API_PREFIX, routes(dependencies))

		// Error handling middleware
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
			error: {
				message: err.message,
			},
			});
		});
  

		app.listen(PORT, () => {
			console.log("Server :", chalk.blue(PORT), chalk.green("connected"))

			// connect DB
			const { DB } = dependencies
			checkDatabaseConnection(DB)
		})
	},
}
