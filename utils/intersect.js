'use strict';

/**
 * Intersection of two arrays
 * @param {Array|Set} a 
 * @param {Array|Set} b 
 * @return {Array} the intersection of the input arrays
 */
module.exports = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
    return [...setA].filter(x => setB.has(x));
};