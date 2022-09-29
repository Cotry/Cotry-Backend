//libraries import
const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
var cookieParser = require('cookie-parser');
// custom modules import
const db = require("./app/models");
const sessions_dbConfig = require("./app/config/sessions_db.config.js");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

var corsWhitelist = ['https://cotry.club', 'https://www.cotry.club', 'http://localhost:3000'];

var corsOptions = {
  origin: corsWhitelist,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// // Advance CORS blocking for Postman and other proxies.
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (corsWhitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
// app.use(cors(corsOptions));


// parse requests of json content-type, so that we can use access data like req.body.jsonProperty
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

// db = object with configured db details.
db.sequelize.sync();

// drop the table if it already exists - for development only
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

/**
 * -------------- SESSION SETUP ----------------
 */

const pgPool = new pg.Pool(sessions_dbConfig);

// Best Practices: https://blog.jscrambler.com/best-practices-for-secure-session-management-in-node
app.use(session({
  //We can have multiple secrets as an array.
  //The first secret will be used to sign the cookie.
  //The rest will be used in verification.
  secret: process.env.SESSIONSSECRET,
  name: 'vericheck',
  store: new pgSession({
    pool: pgPool                // Connection pool
  }),
  // Ref: https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
  // It basically means that for every request to the server, it reset the session cookie
  resave: false,
  // True, means that Your session is only Stored into your storage, when any of the Property is modified in req.session
  saveUninitialized: true,
  cookie: {
    // httpOnly: true, //Prevent javascript access to cookie
    // secure: true, //cookie data will be sent only if connection is HTTPS
    // sameSite: true,
    maxAge: 1000 * 60 * 60 * 2 // = Time is in milliseconds for 10min
    // maxAge: 1000 * 60 * 60 * 24 // Time is in milliseconds for 1 day
  }
}));

// parse cookie and update the request object
app.use(cookieParser());

// simple route for load balancer health
app.get('/', (req, res, next) => {
  res.send('Health is OK.');
});


// add routes
require("./app/routes/user.routes")(app);
require("./app/routes/main.routes")(app);


// set port, listen for requests
const PORT = process.env.APPPORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
