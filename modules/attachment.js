'use strict';
const locationController = require('../controllers/locationController');
const Futar = require('../controllers/futarController');


module.exports = (bot) => {
    const userController = require('../controllers/userController')(bot);
    const Schedule = require('../intents/schedule')(bot);
    const ChitChat = require('../intents/chitChat')(bot);
    const StartStopPicker = require('../messages/startStopPicker')(bot);

    bot.on('attachment', (payload, chat) => {
        const userId = payload.sender.id;
        const attachments = payload.message.attachments;

        userController.getUser(userId)
            .then(user => handleAttachment(user, attachments[0]));
    });

    const handleAttachment = (user, attachment) => {
        switch (attachment.type) {

            case 'location': {
                let location;
                return locationController.fromAttachment(attachment, user.id)
                    .then(loc => {
                        location = loc;
                        return Futar.stopsForLocation(location);
                    })
                    .then(stops => {
                        if (stops.length < 1) return StartStopPicker(user, location);
                        return Schedule.sendDeparturesFromNearbyStops(user, stops, location);
                    })
                    .catch(err => {
                        console.error(err);
                        StartStopPicker(user, location);
                    });
            }

            default:
                return ChitChat.sendEmoji(user);
        }
    };
};