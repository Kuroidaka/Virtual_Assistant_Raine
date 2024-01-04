const puppeteer = require('puppeteer');
const summary = require("./summarize")
const { DynamicStructuredTool } = require("langchain/tools");
const { z } = require("zod")

module.exports = ({currentLang}) => { 

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
            description: `Useful when you need to get data from a website url. The input for this tool contain 2 argument (url, objective) - The "objective" is the targeted questions you want to know - DO NOT make up any "url", the "url" should only be the link to the website from the search tool results. The the output will be a json string.`,
            func: async ({url, objective}) => {
            console.log("url:", url)
            console.log("objective:", objective)
            return execute({url, objective});
            },
            schema: scrapeWebsiteSchema,
        });
        }
    }

    const execute = async ({url, objective}) => {
    
        const headlessBrowser = await puppeteer.launch({ 
            headless: 'new',
            executablePath: "/usr/bin/google-chrome",
            args: ['--no-sandbox'],
        });
        
        try {
        
            const newTab = await headlessBrowser.newPage();
            
            await newTab.goto(url);
        
            await newTab.waitForSelector('body');
        
            let text = await newTab.evaluate(() => document.body.innerText);
            
            if(text.length > 8000) {
               text = await summary({currentLang}).execute(text, objective)
            }
            return JSON.stringify(text)
            
        } catch (error) {
            console.log(error)
            return error
        }
        finally {
            headlessBrowser.close();
        }
    
    }
    
    return { execute, ScrapeWebsiteTool }
}
