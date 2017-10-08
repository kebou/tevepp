'use strict';
const crypto = require('crypto');
const APP_SECRET = process.env.APP_SECRET || '04eb9f8dcd5fabd906599c9007699222';

module.exports = {
    setJSONBody
};

function setJSONBody(requestParams, context, ee, next) {
    const text = requestParams.json.entry[0].messaging[0].message.text;
    requestParams.json.entry[0].messaging[0].message.text = text.match(/{{ .* }}/) ? context.vars.text : text;
    const buf = new Buffer.from(JSON.stringify(requestParams.json));
    const hash = crypto.createHmac('sha1', APP_SECRET)
        .update(buf)
        .digest('hex');

    const signature = `sha1=${hash}`;
    requestParams.headers['x-hub-signature'] = signature;
    
    return next(); // MUST be called for the scenario to continue
}
