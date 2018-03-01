const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();

var app = express();
app.use(bodyParser.json());
const port = 8889;

// const request = require('request');
// const moment = require('moment-timezone');
const fetchTrips = require('../yelp').fetchTrips;


// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.options("/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

// app.options('*', cors()) // include before other routes
// app.options('/', cors())
app.post('/', cors(), async (req, res) => {
    try {
        const arr = await fetchTrips(Object.assign({}, req.body, { startTime: new Date(), endTime: new Date() }));
        res.send(JSON.stringify(arr));
    } catch (e) {
        console.log(e);
    }

});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});