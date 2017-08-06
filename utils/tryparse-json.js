'use strict';

module.exports = (str) => {
    try {
        const o = JSON.parse(str);

        if (o && typeof o === 'object') {
            return o;
        }
    }
    catch (error) { } // eslint-disable-line no-empty

    return false;
};