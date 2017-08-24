'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    return {
        welcome: require('./chitChat/welcomeMessage')(bot),
        allIsWell: require('./chitChat/allIsWellMessage')(bot),
        outOfScope: require('./chitChat/outOfScopeMessage')(bot),
        greeting: require('./chitChat/greetingMessage')(bot),
        joke: require('./chitChat/jokeMessage')(bot),
        help: require('./chitChat/helpMessage')(bot),
    };
};
