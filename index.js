'use strict';

const mongoose = require('mongoose');
// const User = require('./models/userModel');
// const Location = require('./models/locationModel');
// const Image = require('./models/imageModel');
// const Feedback = require('./models/feedbackModel');
// const StopName = require('./models/stopNameModel');

const locationController = require('./controllers/locationController');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb');


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



// const FutarAPI = require('futar-api');
// const futar = new FutarAPI({});
// const Stop = require('./models/stopModel');




const leg = {
    "from": {
        "id": "BKK_009119",
        "latitude": 47.659618,
        "longitude": 19.074522,
        "name": "Szentendre H",
        "rawName": "Szentendre",
        "shortName": "Szentendre"
    },
    "to": {
        "id": "BKK_008940",
        "latitude": 47.598633,
        "longitude": 19.054086,
        "name": "Békásmegyer H",
        "rawName": "Békásmegyer",
        "shortName": "Békásmegyer"
    },
    "route": {
        "id": "BKK_9430",
        "name": "943",
        "headsign": {
            "name": "Békásmegyer H",
            "rawName": "Békásmegyer",
            "shortName": "Békásmegyer"
        },
        "type": "BUS",
        "color": "1E1E1E"
    },
    "duration": 1140000,
    "startTime": 1501284000000,
    "endTime": 1501285140000,
    "intermediateStops": 7
}


const Canvas = require('./controllers/canvasController');
Canvas.tripDetails(leg)
    .then(console.log)
    .catch(console.error);







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
const tripPlanning = require('./intents/tripPlanning.js')(bot);
const schedule = require('./intents/schedule.js')(bot);

// Futar.searchRoute('17')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));

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

// findDirections('széll kálmán tér', '6')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));



// Futar.getDirections('BKK_F00471', [ 'BKK_6400', 'BKK_6470' ])
//     .then(res => console.log(res))
//     .catch(err => console.log(err));

    

/**
 * Intersection of two arrays
 * @param {Array|Set} a 
 * @param {Array|Set} b 
 * @return {Array} the intersection of the input parameteres
 */
const intersect = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
    return [...setA].filter(x => setB.has(x));
};

// locationController.fromText('Széll Kálfsvasvmán tér', 3)
//     .then(location => Futar.stopsForLocation(location))
//     .then(stops => console.log(stops));

// const start = {
//     "userId": 3,
//     "title": "Szentendre, Nap utca",
//     "latitude": 47.6784491,
//     "longitude": 19.0700342,
//     "city": "Szentendre",
//     "streetName": "Nap utca",
//     "zipCode": 2000,
//     "__v": 0
// };

// const stop = {
//     "userId": 3,
//     "title": "Budapest, Batthyány utca 48.",
//     "latitude": 47.5066813,
//     "longitude": 19.0283844,
//     "city": "Budapest",
//     "streetName": "Batthyány utca",
//     "streetNumber": "48",
//     "zipCode": 1015,
//     "__v": 0
// };


const AskStartMessage = require('./messages/tripPlanningAskStartMessage');
const InvalidLocationMessage = require('./messages/invalidLocationMessage');
const TripPlanningCanceledMessage = require('./messages/tripPlanningCanceledMessage');

const askStart = (convo) => {
    const question = (convo) => {
        const user = convo.get('user');
        return AskStartMessage(user);
    };

    const handleAnswer = (payload, convo) => {
        locationController.fromPayload(payload)
            .then(location => {
                const user = convo.get('user');
                let start = convo.get('start');
                let stop = convo.get('stop');

                if (!start && !stop) {
                    convo.set('start', location);
                    return askStop(convo);
                }
                if (start) stop = location;
                if (stop) start = location;

                return tripPlanning.sendTripSummary(user, start, stop);
            })
            .catch(err => {
                console.error(err);
                const user = convo.get('user');
                InvalidLocationMessage(user)
                    .then(() => askStart(convo));
            });
    };

    const callbacks = [
        {
            event: 'quick_reply:END_CONVO',
            callback: (payload, convo) => {
                const user = convo.get('user');
                return TripPlanningCanceledMessage(user)
                    .then(() => convo.end());
            }
        },
        {
            event: 'quick_reply:ADD_HOME',
            callback: (payload, convo) => {
                // add first favourite location
                console.log('ADD_HOME QR');
                convo.end();
            }
        }
    ];

    const options = {};

    convo.ask(question, handleAnswer, callbacks, options);
};


const onExiting = (code) => {
    const exitCode = code || 0;
    mongoose.disconnect()
        .then(() => {
            console.log('\nMongoose is disconnected through app termination.');
            process.exit(exitCode);
        });
};

process.on('SIGINT', onExiting).on('SIGTERM', onExiting);

process.on('uncaughtException', (err) => {
    console.error('Exiting with uncaught Exception: ' + err.toString());
    onExiting(1);
});