'use strict';
const logger = require('winston');

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);
    const ChitChat = require('../../intents/chitChat')(bot);

    bot.on('referral', (payload, chat) => {
        const { sender, referral } = payload;
        const userId = sender.id;
        const type = referral.ref.toUpperCase();

        userController.getUser(userId)
            .then(user => addUserSource(user, referral))
            .then(user => handleReferral(user, chat, type));
    });

    const handleReferral = (user, chat, type) => {
        switch (type) {

            case 'FB_DATA_COLLECTION':
                return ChitChat.sendTesterMessage(user);

            default:
                logger.warn('Unknown referral called:', type);
                return ChitChat.sendGreeting(user);
        }
    };

};

const addUserSource = (user, referral) => {
    if (user.source) {
        return user;
    }
    let src = '';
    if (!referral) {
        src = 'unknown';
    } else {
        const { ref, source } = referral;
        src = source.toLowerCase();
        if (ref) {
            src += `_${ref}`;
        }
    }
    user.source = src;
    return user.save();
};