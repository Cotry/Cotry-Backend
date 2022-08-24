const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    // use_env_variable: true,
    development: {
        host: process.env.DBHOST,
        port: process.env.DBPORT,
        username: process.env.TESTDBUSER,
        password: process.env.TESTDBPASS,
        database: process.env.TESTDBNAME,
        dialect: "postgres",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    production: {
        host: process.env.DBHOST,
        port: process.env.DBPORT,
        username: process.env.MASTERDBUSER,
        password: process.env.MASTERDBPASS,
        database: process.env.MASTERDBNAME,
        dialect: "postgres",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

};