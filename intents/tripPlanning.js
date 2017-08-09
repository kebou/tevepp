'use strict';
const BootBot = require('bootbot');
const Canvas = require('../controllers/canvasController');
const Futar = require('../controllers/futarController');
const locationController = require('../controllers/locationController');
const TripDetails = require('../models/tripDetailsModel');


module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const Message = require('../messages/tripPlanningMessages')(bot);

    const askStart = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            return Message.askStart(user);
        };

        const handleAnswer = (payload, convo) => {
            return locationController.fromPayload(payload)
                .then(location => {
                    const user = convo.get('user');
                    let start = convo.get('start');
                    let stop = convo.get('stop');

                    if (!start && !stop) {
                        convo.set('start', location);
                        return askStop(convo);
                    }
                    if (start) stop = location;
                    else start = location;

                    return _sendTripSummary(user, start, stop)
                        .then(() => convo.end());
                })
                .catch(err => {
                    if (err.name !== 'LocationError') {
                        throw err;
                    }
                    console.error(err);
                    const user = convo.get('user');
                    return Message.invalidLocation(user)
                        .then(() => askStart(convo));
                });
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:FAVOURITES',
                callback: (payload, convo, data) => {
                    convo.end();
                    return bot._handleEvent('quick_reply', payload, data);
                }
            }
        ];

        const options = {};

        convo.ask(question, handleAnswer, callbacks, options);
    };

    const askStop = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            return Message.askStop(user);
        };

        const handleAnswer = (payload, convo) => {
            return locationController.fromPayload(payload)
                .then(location => {
                    const user = convo.get('user');
                    let start = convo.get('start');
                    let stop = convo.get('stop');

                    if (!start && !stop) {
                        convo.set('stop', location);
                        return askStart(convo);
                    }
                    if (start) stop = location;
                    else start = location;

                    return _sendTripSummary(user, start, stop)
                        .then(() => convo.end());
                }, err => {
                    if (err.name !== 'LocationError') {
                        throw err;
                    }
                    console.error(err);
                    const user = convo.get('user');
                    return Message.invalidLocation(user)
                        .then(() => askStop(convo));
                });
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:FAVOURITES',
                callback: (payload, convo, data) => {
                    convo.end();
                    return bot._handleEvent('quick_reply', payload, data);
                }
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    const sendTripDetails = (user, tripDetailsId) => {
        return TripDetails.findById(tripDetailsId).exec()
            .then(res => {
                if (res === null) {
                    const err = new Error('Trip Details not found.');
                    err.name = 'TripDetailsMissingError';
                    throw err;
                }
                return _createTripDetailsImages(res);
            })
            .then(res => Message.tripDetails(user, res.legs))
            .catch(err => {
                console.error(err);
                if (err.name !== 'TripDetailsMissingError') {
                    throw err;
                }
                return;
            });
    };

    const _createTripDetailsImages = (tripDetails) => {
        const promises = tripDetails.legs.map(leg => Canvas.tripDetails(leg));
        return Promise.all(promises)
            .then(imgIds => {
                for (let i in imgIds) {
                    tripDetails.legs[i].imageId = imgIds[i];
                }
                return tripDetails;
            });
    };


    const _sendTripSummary = (user, start, stop) => {
        let tripData;
        return Message.searchingTrip(user, start, stop)
            .then(() => bot.sendAction(user.id, 'typing_on'))
            .then(() => Futar.planTrip(start, stop))
            .then(res => _saveTripDetails(res))
            .then(res => _createTripSummaryImages(res))
            .then(res => {
                tripData = res;
                return bot.sendAction(user.id, 'typing_off');
            })
            .then(() => {
                if (tripData.options.length < 1) {
                    return Message.tripWalkDistance(user, tripData.to);
                }
                return Message.tripSummary(user, tripData.options);
            })
            .catch(err => {
                console.error(err);
                return Message.tripPlanningFailed(user);
            });
    };

    const _createTripSummaryImages = (tripData) => {
        const promises = tripData.options.map(option => Canvas.tripSummary(option.legs));
        return Promise.all(promises)
            .then(imgIds => {
                for (let i in imgIds) {
                    tripData.options[i].imageId = imgIds[i];
                }
                return tripData;
            });
    };

    const _saveTripDetails = (tripData) => {
        const promises = tripData.options.map(option => {
            const td = new TripDetails(option);
            return td.save();
        });
        return Promise.all(promises)
            .then(options => {
                for (let i in options) {
                    tripData.options[i] = options[i];
                }
                return tripData;
            });
    };

    return {
        askStart,
        askStop,
        sendTripDetails
    };
};
