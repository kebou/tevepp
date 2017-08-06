'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    const Message = require('../messages/chitChatMessages')(bot);

    const sendGreeting = (user) => Message.greeting(user);

    const sendJoke = (user) => Message.joke(user);

    const sendHelp = (user) => Message.help(user);

    return {
        sendGreeting,
        sendJoke,
        sendHelp
    };
};