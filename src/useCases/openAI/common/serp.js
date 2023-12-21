const axios = require("axios")

module.exports = () => {

    const execute = async (q) => {

        try {
            const myHeaders = {
                "X-API-KEY": "559ff02d37e645503da07cdb805a5dc1a2d4a23b",
                "Content-Type": "application/json"
            };
            
            const raw = {
                q: q
            };
              
    
            const requestOptions = {
                method: 'post',
                url: "https://google.serper.dev/search",
                headers: myHeaders,
                data: raw,
                followRedirect: true
            };
            
            const res = await axios(requestOptions)

            if(res.statusText = "OK") { 
                // console.log(res.data.knowledgeGraph)
                return res.data
            }

        } catch (error) {
            console.log(error)
            return error
        }
    }

    return { execute } 
}