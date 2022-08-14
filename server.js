const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

var corsWhitelist = ['https://cotry.club', 'https://www.cotry.club', 'http://localhost:3000'];

var corsOptions = {
  origin: corsWhitelist,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Advance CORS blocking for Postman and other proxies.
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


// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./app/models");
db.sequelize.sync();
// drop the table if it already exists - for development only


db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});
// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to Cotry Backend application." });
// });

require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.APPPORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
