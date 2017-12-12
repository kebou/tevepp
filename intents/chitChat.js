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

    const sendAllIsWell = (user) => Message.allIsWell(user);

    const sendWelcome = (user) => Message.welcome(user);

    const sendFarewell = (user) => Message.farewell(user);

    const sendOutOfScope = (user) => Message.outOfScope(user);

    const sendEmoji = (user) => Message.emoji(user);

    const sendTesterMessage = (user) => Message.dataCollection(user);

    return {
        sendGreeting,
        sendJoke,
        sendHelp,
        sendAllIsWell,
        sendWelcome,
        sendFarewell,
        sendOutOfScope,
        sendEmoji,
        sendTesterMessage
    };
};