function* partitions(myList) {
    if (!(myList && myList.length && myList.length > 0)) {
        yield [];
    }
    else {
        for (let partition of partitions( myList.slice(0,-1) )) {
            for (let i = 0; i < partition.length; i++) {
                let partitionCopy = partition.slice();
                //if (myList[myList.length - 1] - partitionCopy[i][partitionCopy[i].length - 1] <= 1) {
                    partitionCopy[i] = partitionCopy[i].concat([ myList[myList.length - 1] ]);
                //}
                yield partitionCopy;
            }
            yield partition.concat([[ myList[myList.length - 1] ]]);
        }
    }
}

const myArray =  ['1', '2', '3'];
console.log([...parts(myArray)]);

// stringes
function* parts(s) {
    if (!(s && s.length && s.length > 0)) {
        yield [];
    } else {
        for (let i = 1; i < s.length + 1; i++) {
            for (let p of parts(s.slice(i))) {
                yield [s.slice(0,i)].concat(p);
            }
        }
    }
}