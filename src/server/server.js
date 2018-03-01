const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();

var app = express();
app.use(bodyParser.json());
const port = 8889;

const fetchTrips = require('../yelp').fetchTrips;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.options("/", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});

app.post('/', async (req, res) => {
    try {
        const arr = await fetchTrips(Object.assign({}, req.body, { startTime: new Date(), endTime: new Date() }));
        res.send(JSON.stringify(arr));
    } catch (e) {
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});