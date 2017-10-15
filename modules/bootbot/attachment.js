'use strict';
const logger = require('winston');
const locationController = require('../../controllers/locationController');
const Futar = require('../../controllers/futarController');

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const Schedule = require('../../intents/schedule')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);
    const StartStopPicker = require('../../messages/startStopPicker')(bot);

    bot.on('attachment', (payload, chat) => {
        const userId = payload.sender.id;
        const attachments = payload.message.attachments;
        const attachment = attachments && attachments.length > 0 && attachments[0];

        return userController.getUser(userId)
            .then(user => {
                logger.info(`New ${attachment.type} attachment received from ${user.lastName} ${user.firstName}.`);
                return user;
            })
            .then(user => handleAttachment(user, attachment));
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
                        logger.debug(err);
                        return StartStopPicker(user, location);
                    });
            }

            default:
                return ChitChat.sendEmoji(user);
        }
    };
};