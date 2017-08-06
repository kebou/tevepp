'use strict';
const {Wit, log} = require('node-wit');
const config = require('config');

const WIT_ACCESS_TOKEN = process.env.WIT_ACCESS_TOKEN || config.get('witAccessToken');

const wit = new Wit({
    accessToken: WIT_ACCESS_TOKEN,
    logger: log.Logger(log.DEBUG)
});

module.exports.getIntent = (message) => {
    return wit.message(message)
        .then(data => {
            const intent = data && data.entities &&
            data.entities.intent && 
            Array.isArray(data.entities.intent) && 
            data.entities.intent.length > 0 && 
            data.entities.intent[0];

            if (!intent) {
                return null;
            }  
            console.log(data.entities);
            if (intent.confidence < 0.3) {
                return null;
            }
            return intent.value.toUpperCase();
        });
};