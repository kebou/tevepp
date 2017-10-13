'use strict';
const BootBot = require('bootbot');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }

    return {
        thanksForFeedback: require('./feedback/thanksForFeedbackMessage')(bot),
        canceled: require('./feedback/canceledMessage')(bot),
        skipImageUpload: require('./feedback/skipImageUploadMessage')(bot),
        attachImage: require('./feedback/attachImageMessage')(bot),
        addTextFirst: require('./feedback/addTextFirstMessage')(bot),
        listening: require('./feedback/listeningMessage')(bot),
        intro: require('./feedback/introMessage')(bot),
    };

};
