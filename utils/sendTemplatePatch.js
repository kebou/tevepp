'use strict';

module.exports = function (recipientId, payload, options) {
    const message = {
        attachment: {
            type: 'template',
            payload
        }
    };

    let quickReplies;
    options && options.quickReplies && (quickReplies = options.quickReplies) && (delete options.quickReplies);
    const formattedQuickReplies = this._formatQuickReplies(quickReplies);
    if (formattedQuickReplies && formattedQuickReplies.length > 0) {
        message.quick_replies = formattedQuickReplies;
    }
    
    return this.sendMessage(recipientId, message, options);
};