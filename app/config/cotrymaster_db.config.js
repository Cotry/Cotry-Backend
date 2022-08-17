const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    HOST: process.env.DBHOST,
    PORT: process.env.DBPORT,
    USER: process.env.MASTERDBUSER,
    PASSWORD: process.env.MASTERDBPASS,
    DB: process.env.MASTERDBNAME,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};