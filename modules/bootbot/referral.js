'use strict';

module.exports = (bot) => {
    const userController = require('../../controllers/userController')(bot);

    bot.on('referral', (payload, chat) => {
        const { sender, referral } = payload;
        const userId = sender.id;

        console.log(payload);

        userController.getUser(userId)
            .then(user => addUserSource(user, referral))
            .then(console.log);
    });

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