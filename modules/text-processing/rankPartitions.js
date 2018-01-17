'use strict';
const logger = require('winston');
const getPartitions = require('../../utils/partitions');
/**
 * In: map, MAX_WORD_NUMBER
 * Out: partitions
 */
module.exports = (ctx, next) => {
    const { map, MAX_WORD_NUMBER } = ctx;
    if (!map || !MAX_WORD_NUMBER) {
        const errorMessage = '#rankPartitions module should be used after "map", "MAX_WORD_NUMBER" property in ctx';
        const err = new Error(errorMessage);
        err.name = 'PipelineError';
        throw err;
    }
    const partitions = getPartitions(0, map.length - 1, MAX_WORD_NUMBER);
    const rankedPartitions = rankPartitions(partitions, map);
    const sortedPartitions = sortPartitions(rankedPartitions);

    ctx.partitions = sortedPartitions;
    return next();
};

const rankPartitions = (partitions, map) => {
    return partitions.map(partition => {
        return partition.reduce((parts, x) => {
            const node = map[x[0]][x[1]];
            parts.score += node.score;
            parts.nodes.push(node);
            return parts;
        }, { score: 0, nodes: [] });
    });
};

const sortPartitions = (partitions) => {
    return partitions.sort((a, b) => b.score - a.score);
};