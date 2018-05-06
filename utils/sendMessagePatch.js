'use strict';

module.exports = function sendMessage(recipientId, message, options) {
    const recipient = this._createRecipient(recipientId);
    const onDelivery = options && options.onDelivery;
    const onRead = options && options.onRead;
    const req = () => (
        this.sendRequest({
            recipient,
            message,
            messaging_type: options && options.messaging_type || 'RESPONSE'
        }).then((json) => {
            if (typeof onDelivery === 'function') {
                this.once('delivery', onDelivery);
            }
            if (typeof onRead === 'function') {
                this.once('read', onRead);
            }
            return json;
        })
    );
    if (options && options.typing) {
        const autoTimeout = (message && message.text) ? message.text.length * 10 : 1000;
        const timeout = (typeof options.typing === 'number') ? options.typing : autoTimeout;
        return this.sendTypingIndicator(recipientId, timeout).then(req);
    }
    return req();
};
