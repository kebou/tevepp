'use strict';

const partitions = module.exports = (start, end, max) => {
    let x = start;
    let y = start;
    const array = [];


    while (x <= end && y <= end) {

        const limit = array.length;
        for (let i = 0; i < limit; i++) {
            const last = array[i][array[i].length - 1];

            if (last[1] < x && last[1] < y) {
                const arr = array[i].concat([[x, y]]);
                array.push(arr);
            }
        }
        array.push([[x, y]]);

        if (y-x+1 === max || y === end) {
            y = ++x;
        } else {
            y++;
        }
    }
    return array;
};