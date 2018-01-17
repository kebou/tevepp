'use strict';

const IncomingWebhook = require('@slack/client').IncomingWebhook;

const url = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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';
const wh = new IncomingWebhook(url, {
    username: 'Futarbot Feedback',
    iconUrl: 'http://i.imgur.com/z5GVn1v.png',
});

module.exports.sendFeedback = (user, feedback) => {
    const author_name = `${user.lastName} ${user.firstName}`;

    let color = '';
    switch (user.role) {
        case 'tester': color = 'warning'; break;
        case 'admin': color = 'danger'; break;
        default: color = 'good';
    }

    const attachment = {
        fallback: `${author_name} visszajelzést küldött: ${feedback.text}`,
        author_name,
        author_icon: user.profilePic,
        text: feedback.text,
        image_url: feedback.image || '',
        footer: `Feedback ID: ${feedback.id}`,
        color,
        ts: feedback.createdAt.getTime / 1000
    };

    return wh.send({ attachments: [attachment] });
};

module.exports.sendError = (error) => {
    const attachment = {
        fallback: `${error.name} típusú hiba történt.`,
        title: `_${error.name}_ típusú hiba történt:`,
        text: `_${error.message}_`,
        footer: (new Date()).toString(),
        color: 'warning'
    };

    return wh.send({ attachments: [attachment] });
};