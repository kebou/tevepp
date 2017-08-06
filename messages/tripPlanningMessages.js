'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    return {
        tripDetails: require('./tripPlanning/tripDetailsMessage')(bot),
        searchingTrip: require('./tripPlanning/searchingTripMessage')(bot),
        askStart: require('./tripPlanning/askStartMessage')(bot),
        askStop: require('./tripPlanning/askStopMessage')(bot),
        canceled: require('./tripPlanning/canceledMessage')(bot),
        tripSummary: require('./tripPlanning/tripSummaryMessage')(bot),
        tripWalkDistance: require('./tripPlanning/tripWalkDistanceMessage')(bot),
        tripPlanningFailed: require('./tripPlanning/tripPlanningFailedMessage')(bot),
        invalidLocation: require('./invalidLocationMessage')(bot)
    };
};
