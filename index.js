'use strict';
const mongoose = require('mongoose');

const MONGO_URL = 'localhost';
mongoose.connect(MONGO_URL);




const bot = {
    sendTextMessage: (userId, text, quickReplies) => {
        return new Promise((resolve, reject) => {
            console.log(`User: ${userId}\nText: ${text}`);
            console.log('QR-s:');
            console.log(quickReplies);
            if (userId.length < 4)
                return resolve('Succes!!!!');

            return reject('Fail :(');
        });
    },
    sendButtonTemplate: (userId, text, buttons, options) => {
        return new Promise((resolve, reject) => {
            console.log(`User: ${userId}\nText: ${text}\n`);
            console.log('Buttons:');
            console.log(buttons);
            console.log('QR-s:');
            console.log(options.quickReplies);
            if (userId.length < 4)
                return resolve('Succes!!!!');

            return reject('Fail :(');
        });
    },
    sendGenericTemplate: (userId, elements, options) => {
        return new Promise((resolve, reject) => {
            console.log(`User: ${userId}`);
            console.log('Elements:');
            console.log(elements);
            console.log('QR-s:');
            console.log(options.quickReplies);
            if (userId.length < 4)
                return resolve('Succes!!!!');

            return reject('Fail :(');
        });
    },
    getUserProfile: (userId) => {
        return new Promise((resolve, reject) => {
            if (userId <= 6) {
                const user = {
                    first_name: 'Boldi',
                    last_name: 'Kemény',
                    profile_pic: 'https://scontent.xx.fbcdn.net/v/t31.0-1/10005914_834386046582002_6112022229957466527_o.jpg?oh=2068d6a29a5eb9b517c62e8e79a88da1&oe=59A3342B',
                    locale: 'hu_GA',
                    timezone: 2,
                    gender: 'male'
                };
                return resolve(user);
            }

            return reject(new Error('No user found!'));
        });
    }
};



//////////////////////////////////////////////////////
/////////////       MEGTARTANDÓ       ////////////////
//////////////////////////////////////////////////////
const i18n = require('i18n');
i18n.configure({
    locales: ['hu'],
    directory: './locales',
    defaultLocale: 'hu',
    updateFiles: true,
    objectNotation: true
});

// const userController = require('./controllers/userController')(bot);
// const ChitChat = require('./intents/chitchat')(bot);
// const QR = require('./messages/elements/quickreplies');
// const Button = require('./messages/elements/buttons');
// const Text = require('./messages/elements/texts');
// const Slack = require('./controllers/slackController');



// userController.getUser('3')
//     .then(user => {
//         //console.log(user);
//         // let start;
//         // locationController.fromText('Bécs', user.id)
//         //     .then(loc1 => {
//         //         start = loc1;
//         //         return locationController.fromText('Szentendre, nap utca 52', user.id);
//         //     })
//         //     .then(stop => {
//         //         return tripPlanning.sendTripSummary(user, start, stop)
//         //             .then(res => console.log(res))
//         //             .catch(err => console.log(err));
//         //     });
//         //ChitChat.greetUser(user);

//         // locationController.fromText('Budapest, 1. kerület, batthyány utca 48', user.id)
//         //     .then(loc => {
//         //         user.locations.push(loc);
//         //         user.save()
//         //             .then(() => {
//         //                 User.findById(user.id).populate({
//         //                     path: 'locations',
//         //                     match: { type: 'favourite' }
//         //                 }).exec()
//         //                     .then(alma => console.log(alma));
//         //             });
//         //     });

//     })
//     .catch(err => console.log(err));


// locationController.fromText('Szentendre, nap utca 52', 5)
//     .then(data => console.log(data))
//     .catch(err => console.log(err));

//////////////////////////////////////////////////////
/////////////       MEGTARTANDÓ       ////////////////
//////////////////////////////////////////////////////
const tesztelek = (locations) => {
    const quickReplies = locations.map(QR.favouriteLocation);
};



const Futar = require('./controllers/futarController');

// Futar.searchRoute('17')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));



// Futar.searchStop('Blaha')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));

const Location = require('./controllers/locationController');
// Location.searchLocation('blaha battyhány utca 48')
//     .then(console.log)
//     .catch(console.error);

const NodeGeocoder = require('./utils/node-geocoder');

const mapOpts = {
    provider: 'google',
    language: 'hu',
    region: 'hu',
    apiKey: process.env.MAPS_API_KEY,
    formatter: null,
    excludePartialMatches: true,
    bounds: '47.1523107,18.8460594|47.6837053,19.3915303'
};

const gc = NodeGeocoder(mapOpts);
gc.geocode({ address: 'Albertfalva utca 21', country: 'Magyarország', minConfidence: 0, withBounds: true })
    .then(res => {
        console.log(res);
        process.exit(0);
    })
    .catch(console.error);



const findStopsAndRoutes = (stopName, routeName) => {
    let stops;
    return Futar.searchStop(stopName)
        .then(res => stops = res)
        .then(() => Futar.searchRoute(routeName))
        .then(routes => {
            const routeIds = routes.map(x => x.id);
            return stops.filter(stop => {
                const intersection = intersect(stop.routeIds, routeIds);
                stop.routeIds = intersection;
                return intersection.length;
            });
        });
};

const findDirections = (stopName, routeName) => {
    let stops;
    return findStopsAndRoutes(stopName, routeName)
        .then(res => {
            stops = res;
            const promises = stops.map(stop => Futar.isDepartureFromStop(stop.id, routeName, 70));
            return Promise.all(promises);
        })
        // megállók szűrése indulási idők alapján (ha van indulás x percen belül, akkor jó a megálló)
        .then(res => {
            stops.filter((x, idx) => res[idx]);
            const promises = stops.map(stop => Futar.getDirections(stop.id, stop.routeIds));
            return Promise.all(promises);
        })
        .then(res => {
            return res.reduce((a, b) => a.concat(b), []);
        });
};

// findDirections('széll kálmán tér', '6