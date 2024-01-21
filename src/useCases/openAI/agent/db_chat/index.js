const { spawn } = require('child_process');
require('dotenv').config()
module.exports = (dependencies) => {

    const funcSpec = {
        name: "database_chat",
        description: "The function to process with the database, just for when user mention about the database",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                q: {
                    type: "string",
                    description: "The question that user want to do with the database",
                }
            },
        }
    }
    
    const runScript = async (q) => {

        const data = {
            query_string: q,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            host: process.env.DATABASE_ID,
            port: process.env.FORWARD_DB_PORT
        }
        const dataString = JSON.stringify(data);
        return new Promise((resolve, reject) => {
            let result = '';
            let errorResult = '';
            const processing = spawn('python3', ['src/useCases/openAI/agent/db_chat/script.py', dataString]);
    
            processing.stdout.on('data', (data) => {
                result += data.toString();
                return result 
            });
    
            processing.stderr.on('data', (data) => {
                errorResult += data.toString();
                return errorResult
            });
    
            processing.on('close', (code) => {
                if (code !== 0) {
                    console.error(`child process exited with code ${code}`);
                    reject(new Error(errorResult));
                } else {
                    console.log('child process exited successfully');
                    resolve(result);
                }
            });
        });
    }

    const execute = async  ({args, currentLang, resource}) => {

        const { q } = args
      
        try {
            let contentReturn = ""

            const result = await runScript(q)
            .then(res => {
                console.log(`stdout: ${res}`)
                const returnedObject = JSON.parse(res)
                console.log(returnedObject.sql_query)

                contentReturn = `Based on the following reponse results from database to answer user: 
                result:${returnedObject.response}`
            
                return {
                    content: contentReturn
                }
            
            })
            .catch(error => {
                console.error(`stderr: ${error.message}`)
                throw new Error(error.message)
            });
            
            return result
        
      
        } catch (error) {
          console.log(error)
          return {
            content: `Error: ${error}`
          }
        }
      }

    return { execute, funcSpec }
}


