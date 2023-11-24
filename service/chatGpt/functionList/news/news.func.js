require("dotenv").config();
const axios = require("axios")
const NewsAPI = require('newsapi')
const { log } = require("../../../../config/log/log.config")
const chalk = require("chalk")
const newsapi = new NewsAPI(process.env.NEW_API_KEY)
const fs = require("fs")

const newsService = {
    topHeadLines: async (query, category="general") => {
        // All options passed to topHeadlines are optional, but you need to include at least one of them
        newsapi.v2.topHeadlines({
            q: query,
            language: 'en',
            category: 'business'
        }).then(response => {
            log(response)
            fs.writeFile("data.text", JSON.stringify(response), (err) => {
                if(err) console.log(err)
                console.log("Successfully Written to File.");
            });
            /*
            {
                status: "ok",
                articles: [...]
            }
        */
        })
        .catch(err => {
            log(chalk.red.bold("[ERROR API]: ____TOP-HEADLINES___ "), err)

        })
    },
   
    newsFuncSpec: {
        "name": "get_top_headlines",
        "description": "Get top news headlines by country and/or category",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Freeform keywords or a phrase to search for.",
                },
                "country": {
                    "type": "string",
                    "description": "The 2-letter ISO 3166-1 code of the country you want to get headlines for",
                },
                "category": {
                    "type": "string",
                    "description": "The category you want to get headlines for",
                    "enum": ["business","entertainment","general","health","science","sports","technology"]
                }
            },
            "required": [],
        }
    }
    
}

newsService.topHeadLines('AI')

module.exports = newsService
