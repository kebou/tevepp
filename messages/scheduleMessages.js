'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    return {
        departures: require('./schedule/departuresMessage')(bot),
        invalidRouteName: require('./schedule/invalidRouteNameMessage')(bot),
        invalidStopName: require('./schedule/invalidStopNameMessage')(bot),
        invalidRouteStopPair: require('./schedule/invalidRouteStopPairMessage')(bot),
        nextDeparture: require('./schedule/nextDepartureMessage')(bot),
        selectDirection: require('./schedule/selectDirectionMessage')(bot)
    };
};