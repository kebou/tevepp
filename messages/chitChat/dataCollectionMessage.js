'use strict';
const Text = require('../elements/texts');
const QR = require('../elements/quickreplies');
const Button = require('../elements/buttons');

module.exports = (bot) => {
    const dataCollectionMessage = (user) => {
        const greeting = Text.dataCollection.greeting(user);
        const thanksForTheClick = Text.dataCollection.thanksForTheClick(user);
        const testMe = Text.dataCollection.testMe(user);
        const writeSentences = Text.dataCollection.writeSentences(user);
        const willBeHelpful = Text.dataCollection.willBeHelpful(user);
        const getStarted = Text.dataCollection.getStarted(user);
        const quickReplies = QR.menu(user);
        const options = {};

        return bot.sendTextMessage(user.id, greeting)
            .then(() => bot.sendTextMessage(user.id, thanksForTheClick, [], { typing: 1 }))
            .then(() => bot.sendTextMessage(user.id, testMe, [], { typing: 1 }))
            .then(() => bot.sendTextMessage(user.id, writeSentences, [], { typing: 500 }))
            .then(() => bot.sendTextMessage(user.id, willBeHelpful, [], { typing: 1800 }))
            .then(() => bot.sendTextMessage(user.id, getStarted, quickReplies, { typing: 1300 }));
    };

    return dataCollectionMessage;
};
