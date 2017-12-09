'use strict';
const logger = require('winston');
const Location = require('../../controllers/locationController');

module.exports = (bot) => {
    const TripPlanning = require('../../intents/tripPlanning')(bot);

    const startTripPlanning = (ctx, next) => {
        const { user, chat, start, end } = ctx;
        if (!start && !end) {
            return next();
        }
        if (start && !end) {
            // let getLocation = Location.fromLocation;
            // if (start.type === 'stop') {
            //     getLocation = Location.fromStop;
            // }
            return Location.fromLocation(start.value, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('start', location);
                    logger.info('Starting trip planning:', { text: ctx.text, start });
                    return TripPlanning.askStop(convo);
                }))
                .catch(() => next());
        }
        if (end && !start) {
            // let getLocation = Location.fromLocation;
            // if (end.type === 'stop') {
            //     getLocation = Location.fromStop;
            // }
            return Location.fromLocation(end.value, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('stop', location);
                    logger.info('Starting trip planning:', { text: ctx.text, end });
                    return TripPlanning.askStart(convo);
                }))
                .catch(() => next());
        }
        if (start && end) {
            // let getStartLocation = Location.fromLocation;
            // if (start.type === 'stop') {
            //     getStartLocation = Location.fromStop;
            // }
            // let getEndLocation = Location.fromLocation;
            // if (end.type === 'stop') {
            //     getEndLocation = Location.fromStop;
            // }
            let startLoc;
            return Location.fromLocation(start.value, user.id)
                .then(res => {
                    startLoc = res;
                    return Location.fromLocation(end.value, user.id);
                })
                .then(endLoc => {
                    logger.info('Trip planning:', { text: ctx.text, start, end });
                    TripPlanning.planTrip(user, startLoc, endLoc);
                })
                .catch(() => next());
        }
    };
    return startTripPlanning;
};