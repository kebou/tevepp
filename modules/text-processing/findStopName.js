'use strict';
const Futar = require('../../controllers/futarController');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    let startNameIndex = null;
    let endNameIndex = null;
    for (let index = 0; index < tokens.length; index++) {
        const hfstana = tokens[index].hfstana;
        if (!hfstana || hfstana.length < 1) {
            continue;
        }
        const suffix = hfstana[hfstana.length - 1];
        if (suffix === '[Ill]' || suffix === '[Subl]' || suffix === '[All]' || suffix === '[Ter]') {
            endNameIndex = index;
        }
        if (suffix === '[Ela]' || suffix === '[Del]' || suffix === '[Abl]') {
            startNameIndex = index;
        }
    }

    return Promise.all([getStopFromTokens(tokens, startNameIndex), getStopFromTokens(tokens, endNameIndex)])
        .then(res => {
            if (res[0] !== null) {
                ctx.start = res[0];
            }
            if (res[1] !== null) {
                ctx.end = res[1];
            }
            return next();
        })
        .catch(() => {
            return next();
        });
};

const getStopFromTokens = (tokens, index) => {
    if (index === null) {
        return Promise.resolve(null);
    }
    let array = [];
    let idx = index;
    while (idx !== -1 && (tokens[idx].hfstana[0] === '[/N]' || tokens[idx].hfstana[0] === '[/Num]' || tokens[idx].hfstana[0] === '[/Num|Digit]')) {
        array.push(tokens[idx].lemma);
        idx--;
    }
    array.reverse();
    return findStop(array);
};

const findStop = (array) => {
    const stopName = array.reduce((a, b) => a.concat(' ' + b), '').trim();
    return Futar.searchStop(stopName)
        .then(res => {
            if (res[0].rawName.split(' ')[0].toLowerCase() !== array[0].toLowerCase()) {
                array.shift();
                return findStop(array);
            }
            return res[0];
        })
        .catch(() => {
            if (array.length < 1) {
                return Promise.reject();
            }
            array.shift();
            return findStop(array);
        });
};