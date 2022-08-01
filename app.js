const express = require('express');

const app = express();
const PORT = 5000;

//to allow json, urlencoded middleware, to parse these request types.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
    res.send('<h1> Hello World </h1>'); //client browser
});

app.listen(PORT, () => {
    console.log("Server running");  //node terminal console
});