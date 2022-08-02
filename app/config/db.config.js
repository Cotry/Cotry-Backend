const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    HOST: "localhost",
    USER: process.env.DBUSER,
    PASSWORD: process.env.DBPASS,
    DB: process.env.DBNAME,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};