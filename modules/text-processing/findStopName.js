'use strict';
const Futar = require('../../controllers/futarController');
/**
 * In: tokens
 * Out: start, stop
 */
module.exports = (ctx, next) => {
    const { tokens } = ctx;
    if (!tokens) {
        console.error('findStopName module should be used after "tokens" property in ctx');
        return next();
    }
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
                ctx.start = ctx.start || {};
                ctx.start.type = 'stop';
                ctx.start.value = res[0].stop;
                ctx.start.tokens = res[0].tokens;
            }
            if (res[1] !== null) {
                ctx.end = ctx.end || {};
                ctx.end.type = 'stop';
                ctx.end.value = res[1].stop;
                ctx.end.tokens = res[1].tokens;
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
    while (idx !== -1 && (tokens[idx].content.match(/\W/i) !== null || tokens[idx].hfstana[0] === '[/N]' || tokens[idx].hfstana[0] === '[/Num]' || tokens[idx].hfstana[0] === '[/Num|Digit]')) {
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
            return { stop: res[0], tokens: array };
        })
        .catch(() => {
            if (array.length < 1) {
                return Promise.resolve(null);
            }
            array.shift();
            return findStop(array);
        });
};