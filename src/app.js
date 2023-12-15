const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const chalk = require("chalk");
const bodyParser = require('body-parser');

const initDCBot = require("./discord") 

const routes = require("./api/v1/route");
const dependencies = require("./config/dependencies")

const app = express()
require("dotenv").config();

const API_PREFIX = "/api/v1"
const PORT = process.env.SERVER_PORT || 8000; 


module.exports = {
	start: () => {
		// Middlewares
		app.use(express.json());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));
		app.use(cors()) 
		app.use(cookieParser())
		app.use(morgan('dev'))

		// Routes
		app.use(API_PREFIX, routes(dependencies))

		app.listen(PORT, () => {
			console.log("Server :", chalk.blue(PORT), chalk.green("connected"));
		})

        // init discord bot
        initDCBot(dependencies)
	},
};








