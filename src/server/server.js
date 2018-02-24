const express = require('express');
// const request = require('request');
// const moment = require('moment-timezone');
import { fetchTrips } from '../yelp/index';


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

const port = process.env.PORT || 3000;
var app = express();

// {
//     location: Location;
//     address ?: string;
//     startTime: Date;
//     endTime: Date;
//     money: number;
//     searchTerm: string;
// };
app.post('/', (req, res) => {
    
    console.log(req);
    res.send('Here ya go');
});