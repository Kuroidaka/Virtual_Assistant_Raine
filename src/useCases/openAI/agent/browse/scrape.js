const puppeteer = require('puppeteer');
const summary = require("./summarize")
const { DynamicStructuredTool } = require("langchain/tools");
const { z } = require("zod")

module.exports = ({currentLang, resource}) => { 

    if(!currentLang) {
        currentLang = { 
            "lt": "en-US", 
            "cc": "us",
            "lc": "en"
        }
    }

     // Define scrapeWebsite Schema
    const scrapeWebsiteSchema = z.object({
        url: z.string(),
        objective: z.string(),
    });
    
    // Define tool
    class ScrapeWebsiteTool extends DynamicStructuredTool {
        constructor() {
            super({
                name: "scrape_website",
                description: `Useful when you need to get data from a website url. The input for this tool contain 2 argument (url, objective) - The "objective" is the targeted questions you want to know - DO NOT make up any "url", the "url" should only be the link to the website from the search tool results. The output will be a json string.`,
                func: async ({url, objective}) => {
                    console.log("url:", url)
                    console.log("objective:", objective)
                    const args = {url, objective}
                    return execute({args}).content;
                },
                schema: scrapeWebsiteSchema,
            });
        }
    }

    const funcSpec = {
        name: "scrape_website",
        description: `Useful when you need to get data from a website url or a link.`,
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                url: {
                    type: "string",
                    description: "The url of the website that the user wants to scrape",
                },
                objective: {
                    type: "string",
                    description: "The objective that the user wants to know about the website",
                }
            },
        }
    }

    const execute = async ({args}) => {
        const {url, objective} = args;
        const headlessBrowser = await puppeteer.launch({ 
            headless: 'new',
            executablePath: "/opt/homebrew/bin/chromium",
            args: ['--no-sandbox'],
        });
        let result = {};
        
        try {
            const newTab = await headlessBrowser.newPage();
            
            await newTab.goto(url);
        
            await newTab.waitForSelector('body');
        
            let text = await newTab.evaluate(() => document.body.innerText);
            
            if(text !== undefined) {
                if(text.length > 8000) {
                text = await summary({currentLang, resource}).execute(text, objective)
                }
                result = {
                    content: JSON.stringify(text)
                }
            }
            else {
                result = {
                    content: "No content found"
                }
            }
            console.log("scrape result:", result)
            return result;
            
        } catch (error) {
            console.log(error)
            result = {
                content: "Error: " + error
            }
            return result;
        }
        finally {
            headlessBrowser.close();
        }
    
    }
    
    return { execute, ScrapeWebsiteTool, funcSpec }
}
