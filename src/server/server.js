const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();

var app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const port = 8889;

// const request = require('request');
// const moment = require('moment-timezone');
const fetchTrips = require('../yelp').fetchTrips;


function getEventData() {

    request({
        url: "https://api.meetup.com/2/events?&sign=true&photo-host=public&group_urlname=San-Antonio-PHP-Meetup&status=upcoming&page=50",
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var data = findNextEvents(body.results);
            // figure out a better way to do this
            // problem is the api call is async, and so when you try to pass it in it won't work
            // app.get('/events') should be with the other app.get's down below
            // promises?
            app.get('/events', (req, res) => {
                res.render('events.ejs', { data: data });
            });
        } else {
            console.log('Unable to fetch data.');
        }

    });

}

function getPhotos() {

    request({
        url: "https://api.meetup.com/2/photo_albums?&sign=true&photo-host=public&group_id=18644645&page=20",
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {

            var photos = getPhotosArr(body.results);

            app.get('/photos', (req, res) => {
                res.render('photos.ejs', { photos: photos });
            });
        } else {
            console.log('Unable to fetch data.');
        }

    });

}

app.post('/', async (req, res) => {
    
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