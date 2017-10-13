'use strict';
const BootBot = require('bootbot');
const Feedback = require('../models/feedbackModel');
const Slack = require('../controllers/slackController');

module.exports = (bot) => {
    if (!(bot instanceof BootBot)) {
        throw new Error('This modul has to be required with an instance of BootBot.');
    }
    const Message = require('../messages/feedbackMessages')(bot);

    const askFeedback = (convo) => {
        const user = convo.get('user');
        return Message.intro(user)
            .then(() => _listeningFeedback(convo));
    };

    const _listeningFeedback = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            return Message.listening(user);
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const text = payload.message && payload.message.text;
            if (!text) {
                return Message.addTextFirst(user)
                    .then(() => _listeningFeedback(convo));
            }
            const fbObject = {
                userId: user.id,
                text
            };
            const feedback = new Feedback(fbObject);
            convo.set('feedback', feedback);
            return _askImage(convo);
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            }
        ];

        const options = {};

        convo.ask(question, handleAnswer, callbacks, options);
    };

    const _askImage = (convo) => {
        const question = (convo) => {
            const user = convo.get('user');
            return Message.attachImage(user)
                .then(() => Message.skipImageUpload(user));
        };

        const handleAnswer = (payload, convo) => {
            const user = convo.get('user');
            const feedback = convo.get('feedback');

            if (payload.message.quick_reply) return;

            const imageUrl = payload && payload.message &&
                payload.message.attachments &&
                payload.message.attachments.length > 0 &&
                payload.message.attachments[0].type === 'image' &&
                payload.message.attachments[0].payload.url;

            if (!imageUrl) {
                return _askImage(convo);
            }

            feedback.image = imageUrl;
            return feedback.save()
                .then(() => Slack.sendFeedback(user, feedback))
                .then(() => Message.thanksForFeedback(user))
                .then(() => convo.end());
        };

        const callbacks = [
            {
                event: 'quick_reply:CANCEL',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    return Message.canceled(user)
                        .then(() => convo.end());
                }
            },
            {
                event: 'quick_reply:SEND_FEEDBACK',
                callback: (payload, convo) => {
                    const user = convo.get('user');
                    const feedback = convo.get('feedback');
                    return feedback.save()
                        .then(() => Slack.sendFeedback(user, feedback))
                        .then(() => Message.thanksForFeedback(user))
                        .then(() => convo.end());
                }
            }
        ];

        const options = {};

        return convo.ask(question, handleAnswer, callbacks, options);
    };

    return {
        askFeedback
    };

};
