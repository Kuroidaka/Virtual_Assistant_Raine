// const input ="https://oaidalleapiprodscus.blob.core.windows.net/private/org-wxzLbgPiKeKxXlPYCqpU3Hnf/user-U8JFooqwpwFeIGVSqEkBCNTK/img-9hO8WkavUEzuAzJFcZnpzFm1.png?st=2024-01-13T11%3A41%3A33Z&se=2024-01-13T13%3A41%3A33Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-01-13T02%3A40%3A14Z&ske=2024-01-14T02%3A40%3A14Z&sks=b&skv=2021-08-06&sig=ZfN8vyDfsrmS6V0sgDTqQFLOpXGBVSlCENvnTF5/8Oo%3D"

// const urlRegex = /(http[s]?:\/\/){0,1}(\w+:\w+@){0,1}([a-zA-Z0-9.-]+)(:[0-9]+){0,1}(\/[a-zA-Z0-9.-]+)*\/?/;
// const url = input.match(urlRegex);

// const imageRegex = /\.(jpeg|jpg|gif|png)$/;
// const isImage = imageRegex.test(url[0]);
// console.log(isImage); // Outputs: true

// function extractCodeBlock(input) {
//     const startMarker = '/^```(javascript|js|python)\n([\s\S]*?)\n```$/gm';
//     const startIndex = input.indexOf(startMarker);

//     if (startIndex !== -1) {
//         const endIndex = input.indexOf(startMarker, startIndex + startMarker.length);

//         if (endIndex !== -1) {
//             let extractedString = input.substring(startIndex, endIndex + startMarker.length);
//             return {
//                 extractedString,
//                 remainingString: input.replace(extractedString, ''),
//                 startIndex
//             };
//         }
//     }

//     return {
//         extractedString: '',
//         remainingString: input,
//         startIndex: -1
//     };
// }

// let input = "hi raine\n```javascript\nconosle.log(\"hello world\")\n```\nHIHI";

// let { extractedString, remainingString, startIndex } = extractCodeBlock(input);

// if(startIndex !== -1) {
//     extractedString +=  "dawjkldjwakldjw"

//     remainingString = remainingString.slice(0, startIndex) + extractedString + remainingString.slice(startIndex);
//     console.log(remainingString);
// }




// const codeBlockRegex = /^```(javascript|js|python)\n([\s\S]*?)\n```$/gm;
// let text =  'hi raine\n```javascript\nconosle.log(\"hello world\")\n```\nHIHI\nconst matches = codeBlockRegex.exec(codeBlock);\nif (matches) {\nconst language = matches[1];\nconst code = matches[2];\nconsole.log("Language:", language);\nconsole.log("Code:", code);\n} else {\nconsole.log("Invalid code block format");\n}';



// const codeBlockRegex = /```(javascript|js|python)\n([\s\S]*?)\n```/gm;

// const matches = [...text.matchAll(codeBlockRegex)];
// matches.forEach((match, index) => {
//   const language = match[1];
//   const code = match[2];
//   console.log(`Code block ${index + 1}:`);
//   console.log("Language:", language);
//   console.log("Code:", code);
// });

// const codeBlockRegex = /```(javascript|js|python)\n([\s\S]*?)\n```/gm;


// let codeBlocks = [];
// text.replace(codeBlockRegex, function(match, language, code) {
//   // Adjust the code block here
//   let adjustedCode = code.toUpperCase(); // Example adjustment
//   codeBlocks.push(`\`\`\`${language}\n${adjustedCode}\n\`\`\``);
//   return match; // This does not change the original text
// });

// codeBlocks.forEach(codeBlock => {
//   text = text.replace(codeBlockRegex, codeBlock);
// });

// console.log(text);

// const text = "Here is a code block:\n\n```javascript\nconsole.log('Hello, world!');\n```\n\nAnd here is another one:\n\n```python\nprint('Hello, world!')\n```";

// const codeBlockRegex = /```(javascript|js|python)\n([\s\S]*?)\n```/gm;

// let codeBlocks = [];
// text.replace(codeBlockRegex, function(match, language, code) {
//   // Adjust the code block here

//   codeBlocks.push(`\`\`\`${language}\n${adjustedCode}\n\`\`\``);
//   return match; // This does not change the original text
// });

// codeBlocks.forEach(codeBlock => {
//   text = text.replace(codeBlockRegex, codeBlock);
// });

// console.log(text);

// const str = `const str = "This is a string"; let str2 = 'This is another string'; let str3 = \`This is yet another string\`;`;
// const regex = /(["'`])(.*?)\1/g;

// const codeBoxCss = {
//   string: 'color: blue;'
// };

// const newStr = str.replace(regex, `<span style="${codeBoxCss.string}">$&</span>`);

// // console.log(newStr);
// const str = `
// // This is a single-line comment
// const x = 10;

// /*
// This is a
// multi-line comment
// */
// let y = 20;
// `;

// const regex = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

// let match;
// while ((match = regex.exec(str)) !== null) {
//   console.log(`Matched comment: ${match[0]}`);
// }




const formatCodeBlock = (text) => {
  const codeBlockRegex = /```(javascript|js|python|py|jsx)\n([\s\S]*?)\n```/gm;
  let codeBlocks = [];
  text.replace(codeBlockRegex, function(match, language, code) {
    code = escapeHtml(code);
    let htmlCode = `<span style='color: green'>`;
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      htmlCode += '<p>' + lines[i].replace(/ /g, '&nbsp;') + '</p>';
    }
    htmlCode += '</span>';
    codeBlocks.push(htmlCode);
    return match; // This does not change the original text
  });

  codeBlocks.forEach(codeBlock => {
    text = text.replace(codeBlockRegex, codeBlock);
  });

  return text;
};