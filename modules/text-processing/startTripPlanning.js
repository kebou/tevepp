'use strict';
const Location = require('../../controllers/locationController');

module.exports = (bot) => {
    const TripPlanning = require('../../intents/tripPlanning')(bot);

    const startTripPlanning = (ctx, next) => {
        const { user, chat, start, end } = ctx;
        if (!start && !end) {
            return next();
        }
        if (start) {
            Location.fromText(start.name, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('start', location);
                    return TripPlanning.askStop(convo);
                }))
                .catch(() => next());
        }
        if (end) {
            Location.fromText(end.name, user.id)
                .then(location => chat.conversation(convo => {
                    convo.set('user', user);
                    convo.set('stop', location);
                    return TripPlanning.askStart(convo);
                }))
                .catch(() => next());
        }
    };
    return startTripPlanning;
};