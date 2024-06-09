const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

module.export = groq

// async function main() {
//     const stream = await groq.chat.completions.create({
//         messages: [
//             {
//                 role: "user",
//                 content: "can you do hack"
//             }
//         ],
//         model: "mixtral-8x7b-32768",
//         stream: true,
//     })

//     for await (const chunk of stream){
//         // Print the completion returned by the LLM.
//         process.stdout.write(chunk.choices[0]?.delta?.content || "");
//     }

// }
// main();