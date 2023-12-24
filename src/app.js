const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const chalk = require("chalk")
const bodyParser = require('body-parser')

const initDCBot = require("./discord") 
const tools = require("./tool")
const test = require("../test")

const routes = require("./api/v1/route")
const dependencies = require("./config/dependencies")

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
	start: () => {
		// Middlewares
		app.use(express.json())
		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({extended: true}))
		app.use(cors()) 
		app.use(cookieParser())
		app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

		// Routes
		app.use(API_PREFIX, routes(dependencies))

		app.listen(PORT, () => {
			console.log("Server :", chalk.blue(PORT), chalk.green("connected"))

			// connect DB
			const { DB } = dependencies
			checkDatabaseConnection(DB)
		})

        // init discord bot
        initDCBot(dependencies)

		// Run tools
		tools(dependencies)

		// test 
		test(dependencies)
	},
}
