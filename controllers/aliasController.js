'use strict';
const Alias = require('../models/aliasModel');
const latinize = require('latenize');

let table, pattern;

const replace = (str) => {
    return str.replace(pattern, replacer);
};

const replacer = (match, p1, p2, p3, offset, string) => {
    const name = latinize(match).toLowerCase();
    return table[name].value || string;
};

const update = () => {
    return Alias.find({})
        .then(aliases => {
            table = generateAlternatives(aliases);
            pattern = generatePattern(table);
            return Object.keys(table);
        });
};

const generateAlternatives = (aliases) => {
    const table = {};
    for (let alias of aliases) {
        const alternatives = sortAlternatives(alias.alternatives);
        const value = alias.value;
        for (let alt of alternatives) {
            const name = latinize(alt.name).toLowerCase();
            table[name] = {
                pattern: alt.pattern || name,
                value
            };
        }
    }
    return table;
};

const sortAlternatives = (alternatives) => {
    return alternatives.sort((a, b) => b.name.length - a.name.length);
};

const generatePattern = (alternatives) => {
    if (Object.keys(alternatives).length < 1) {
        return new RegExp('$^');
    }
    return new RegExp(Object.keys(alternatives).map(x => alternatives[x].pattern).join('|'), 'gi');
};

update();

module.exports = {
    update,
    replace
};