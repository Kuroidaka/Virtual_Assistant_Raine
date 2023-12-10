
// const mysql = require('mysql2/promise');
// const DB = mysql.createPool({
//     host: process.env.DATABASE_ID,
//     user: process.env.DATABASE_USERNAME,
//     database: process.env.DATABASE_NAME,
//     password: process.env.DATABASE_PASSWORD,
//     port: '3306',
//     waitForConnections: true,
//     // connectionLimit: 10,
//     // maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//     // idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//     queueLimit: 0,

//   });

const { PrismaClient } = require('@prisma/client')

const DB = new PrismaClient()

async function checkDatabaseConnection() {
  try {
      await DB.$connect();
      console.log('Connection successful');
  } catch (error) {
      console.error('Error connecting to the database: ', error);
  } finally {
      await DB.$disconnect();
  }
}
// checkDatabaseConnection();



module.exports = DB