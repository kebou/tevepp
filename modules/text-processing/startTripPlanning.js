'use strict';
const Location = require('../../controllers/locationController');

module.exports = (bot) => {
    const TripPlanning = require('../../intents/tripPlanning')(bot);

    const startTripPlanning = (ctx, next) => {
        const { user, chat, start, end } = ctx;
        if (!start && !end) {
            return next();
        }
        if (start && !end) {
            return Location.fromStop(start.value, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('start', location);
                    return TripPlanning.askStop(convo);
                }))
                .catch(() => next());
        }
        if (end && !start) {
            return Location.fromStop(end.value, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('stop', location);
                    return TripPlanning.askStart(convo);
                }))
                .catch(() => next());
        }
        if (start && end) {
            let startLoc;
            return Location.fromStop(start.value, user.id)
                .then(res => {
                    startLoc = res;
                    return Location.fromStop(end.value, user.id);
                })
                .then(endLoc => TripPlanning.planTrip(user, startLoc, endLoc))
                .catch(() => next());
        }
    };
    return startTripPlanning;
};