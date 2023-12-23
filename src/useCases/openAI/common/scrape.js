const puppeteer = require('puppeteer');
const sumCommon = require("./summarize")


module.exports = () => { 

    const execute = async (url, objective) => {
    
        const headlessBrowser = await puppeteer.launch({ headless: 'new' });
        
        try {
        
            const newTab = await headlessBrowser.newPage();
            
            await newTab.goto(url);
        
            await newTab.waitForSelector('body');
        
            let text = await newTab.evaluate(() => document.body.innerText);
            
            if(text.length > 8000) {
               text = await sumCommon().execute(text, objective)
            }
            return text
            
        } catch (error) {
            console.log(error)
            return error
        }
        finally {
            headlessBrowser.close();
        }
    
    }
    
    return { execute }
}
