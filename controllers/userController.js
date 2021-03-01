'use strict';

const BootBot = require('bootbot');
const User = require('../models/userModel');
const i18n = require('i18n');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    const getUser = (userId) => {
        return bot.getUserProfile(userId)
            .then(userProfile => {
                console.log({userId, userProfile});
                const update = {
                    firstName: userProfile.first_name,
                    lastName: userProfile.last_name,
                    profilePic: userProfile.profile_pic
                };
                const options = {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                };

                return User.findOneAndUpdate({ _id: userId }, update, options)
                    .populate({ path: 'locations', match: { type: 'favourite' } })
                    .exec()
                    .then(user => _setLocale( user ));
            });
    };

    const _setLocale = (user) => {
        console.log(user);
        const userLocale = 'hu';
        i18n.init(user);
        user.setLocale(userLocale);
        return user;
    };

    const modul = {
        getUser
    };
    return modul;
};