const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const puppeteer = require('puppeteer');



module.exports = () => { 

    const execute = async (url) => {
    
        const headlessBrowser = await puppeteer.launch({ headless: 'new' });
        
        try {
        
            const newTab = await headlessBrowser.newPage();
            
            await newTab.goto(url);
        
            await newTab.waitForSelector('body');
        
            let text = await newTab.evaluate(() => document.body.innerText);
            
            console.log(text);
            
        } catch (error) {
            console.log(error)
        }
        finally {
            headlessBrowser.close();
        }
    
    }
    
    return { execute }
}
