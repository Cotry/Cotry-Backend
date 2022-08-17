const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.SESSIONSDBUSER,
    password: process.env.SESSIONSDBPASS,
    database: process.env.SESSIONSDBNAME,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};