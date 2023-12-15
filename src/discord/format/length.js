
function sliceString(str, lgt) {
    let chunks = [];
    for (let i = 0; i < str.length; i += lgt) {
        chunks.push(str.slice(i, i + lgt));
    }
    return chunks;
}

module.exports = {
    sliceString
}
