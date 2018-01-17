'use strict';
const logger = require('winston');
const Table = require('cli-table');
const round = require('../../utils/round');
/**
 * In: map
 * Out: 
 */
module.exports = (ctx, next) => {
    const { map, partitions, startIdx, endIdx } = ctx;
    if (!map || !partitions) {
        logger.error('#printMap module should be used after "map", "partitions" property in ctx');
        return next();
    }

    if (startIdx !== undefined && endIdx !== undefined) {
        return Promise.resolve(printNode(map[startIdx][endIdx], startIdx, endIdx));
    }
    
    //printRankingDetails(map);
    printTable(map);
    printPartitions(partitions);
    
    return next();
};

const printTable = (map) => {
    let rows = [];
    for (let startIdx in map) {
        const row = {};
        const key = `${startIdx} - ${map[startIdx][startIdx].tokens[0].content}`;
        row[key] = [];
        for (let endIdx in map[startIdx]) {
            let value;
            if (!map[startIdx][endIdx]) {
                value = '-';
            } else {
                value = map[startIdx][endIdx].score;
                value = Math.round(value);
            }
            row[key].push(value);
        }
        rows.push(row);
    }

    let headers = [''];
    for (let idx in map) {
        const label = `${idx} - ${map[idx][idx].tokens[0].content}`;
        headers.push(label);
    }
    let table = new Table({ head: headers });
    table.push(...rows);
    
    console.log(table.toString());
    console.log('\n');
};

const printRankingDetails = (map) => {
    for (let startIdx in map) {
        for (let endIdx in map[startIdx]) {
            const node = map[startIdx][endIdx];
            if (!node) continue;

            printNode(node, startIdx, endIdx);
        }
    }
};

const printNode = (node, startIdx, endIdx) => {
    const text = `# [${startIdx}][${endIdx}] #`;
    let separator = '';
    for (let i = 0; i < text.length; i++) {
        separator += '#';
    }
    console.log(separator);
    console.log(text);
    console.log(separator);
    console.log(`\nTEXT: ${node.text}`);
    console.log(`\nSCORE: ${round(node.score, 2)}`);
    node.scores.forEach(score => printScore(score, ' - '));
    console.log('');
    node.elements.sort((a, b) => b.score - a.score).forEach(element => printElement(element, '  '));
    console.log('');
};

const printElement = (element, prefix) => {
    prefix = prefix || '';
    const title = element.value.name || element.value.title || element.value;
    let text = `${prefix}    ${element.type.toUpperCase()}: ${title}`;
    if (element.type === 'location') {
        text += ` - ${element.value.latitude},${element.value.longitude}`;
    }
    let separator = prefix;
    for (let i = 0; i < text.length+2; i++) {
        separator += '-';
    }
    console.log(text);
    console.log(separator);
    console.log(`${prefix}SCORE: ${round(element.score, 2)}`);
    element.scores.forEach(score => printScore(score, `${prefix} - `));
    console.log('\n');
    //console.log('\n              ...\n');
};

const printScore = (score, prefix) => {
    prefix = prefix || '';
    console.log(`${prefix}${score.source}: ${round(score.value, 2)}`);
};

const printPartitions = (partitions) => {
    console.log('  Ranking  ');
    console.log('###########\n');
    for (let i = 0; i < partitions.length && i < 3; i++) {
        const part = partitions[i];
        const score = i+1 < 4 ? medal(i+1) : `[${i+1}]`;
        console.log(`${score}`, 'SUM:', round(part.score, 2));
        part.nodes.forEach(node => {
            console.log(node.text);
        });
        console.log('\n');
    }
};

const medal = (n) => {
    switch (n) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
};