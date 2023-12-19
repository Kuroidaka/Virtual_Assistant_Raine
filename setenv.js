const fs = require('fs');
const envFile = `.env.${process.env.NODE_ENV}`;

if (!fs.existsSync(envFile)) {
  console.error(`Environment file ${envFile} does not exist.`);
  process.exit(1);
}

require('dotenv').config({ path: envFile });