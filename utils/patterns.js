'use strict';
const latinize = require('./nlg').latinize;

const basicName = '\\b[1-9][0-9]{0,2}[ABE]?(?\:\\b|(?=.s\\b))';
const rail = '\\bH[56789]\\b';
const subway = '\\bM[1234]\\b';
const ferry = '\\bD(?\:1[124])\\b';

module.exports.routeName = () => {
    return new RegExp(basicName + '\|' + rail + '\|' + subway + '\|' + ferry, 'gi');
};

module.exports.routeNameInText = () => {
    return new RegExp(`(?:${basicName}|${rail}|${subway}|${ferry})(?!-?(?:ba|be|bol|ból|ből|rol|ról|ről|ra|re|tol|tól|től|hoz|hez|höz|ig))`, 'gi');
};

module.exports.routeNameWithDelimiter = (delimiter) => {
    return new RegExp(`(${basicName}|${rail}|${subway}|${ferry})` + delimiter, 'i');
};

module.exports.routeNameWithDelimiterAfter = () => {
    return new RegExp(`(?:${basicName}|${rail}|${subway}|${ferry})` + '[ ,.:&;\@-]', 'i');
};

module.exports.routeNameWithDelimiterBefore = () => {
    return new RegExp('[ ,.:&;\@-]' + `(?:${basicName}|${rail}|${subway}|${ferry})$`, 'i');
};

module.exports.favouriteLocation = (text) => {
    return new RegExp(latinize(text), 'gi');
};