const partitions = (start, end) => {
    let x = start;
    let y = start;
    const array = [];


    while (x <= end && y <= end) {

        const limit = array.length;
        for (let i = 0; i < limit; i++) {
            const last = array[i][array[i].length - 1];

            if (x > last[1] && y > last[1]) {
                const arr = array[i].slice().concat([[x, y]]);
                array.push(arr);
            }
        }
        array.push([[x, y]]);

        if (y === end) {
            y = ++x;
        } else {
            y++;
        }
    }

    return array;
};

console.log(partitions(1,3));