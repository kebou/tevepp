'use strict';

const basicName = '[1-9]{1,3}[A-Z]?';
const rail = 'H[56789]';
const subway = 'M[1234]';
const ferry = 'D(?:2|1[124])';

module.exports.routeName = () => {
    return new RegExp(`^${basicName}$|^${rail}$|^${subway}$|^${ferry}$`, 'i');
};

module.exports.routeNameWithDelimiter = (delimiter) => {
    return new RegExp(`(^${basicName}|^${rail}|^${subway}|^${ferry})` + delimiter, 'i');
};