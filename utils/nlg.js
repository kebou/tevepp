'use strict';


module.exports.appendRouteSuffix = (user, routeName) => {
    if (user.locale === 'hu') {
        const suffix = _getHunSuffix(routeName);
        if (suffix === '') return routeName;
        return routeName + '-' + suffix;
    }
    return routeName;
};

module.exports.appendArticle = (user, str) => {
    if (user.locale === 'hu') {
        return _getHunArticle(str) + ' ' + str;
    }
    return str;
};

const capitalize = module.exports.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const _getHunArticle = (str) => {
    const c = str.charAt(0).toLowerCase();
    if (c === 'a' || c === 'á' || c === 'e' || c === 'é' || c === 'i' || c === 'í' || c === 'o' || c === 'ó' || c === 'ö' || c === 'ő' || c === 'u' || c === 'ú' || c === 'ü' || c === 'ű' || c === '5' || str === '1') {
        return 'az';
    }
    return 'a';
};

const _getHunSuffix = (name) => {
    const c = name.slice(-1);
    const cc = name.length > 1 ? name.slice(-2) : null;

    if (c === '1' || c === '2' || c === '4' || c === '7' || c === '9' || name === '10') {
        return 'es';
    }
    if (c === '3' || c === '8' || cc === '00' || c === '0') {
        return 'as';
    }
    if (c === '5') {
        return 'ös';
    }
    if (c === '6') {
        return 'os';
    }
    return '';
};