'use strict';
const logger = require('winston');
/**
 * In: partitions
 * Out: start, end, routeName
 */
module.exports = (ctx, next) => {
    const { partitions } = ctx;
    if (!partitions) {
        logger.error('#setContext module should be used after "partitions" property in ctx');
        return next();
    }

    if (partitions.length < 1) {
        logger.verbose('Partitions array is empty, setContext skipped.');
        return next();
    }

    const bestMatch = partitions[0];
    const nodes = bestMatch.nodes;

    if (bestMatch.score < 100) {
        logger.debug('BestElement\'s score is smaller than 100, setContext skipped.');
        return next();
    }

    //console.log(JSON.stringify(partitions, null, 4));

    const { startLocations, endLocations, locations, routeNames } = sortNodes(nodes);
    // console.log('startLocations', startLocations);
    // console.log('endLocations', endLocations);
    // console.log('locations', locations);
    // console.log('routeNames', routeNames);
    
    const start = (startLocations.length > 0 && startLocations.shift()) || (locations.length > 0 && locations.shift());
    const end = (endLocations.length > 0 && endLocations.shift()) || (locations.length > 0 && locations.shift());
    const routeName = routeNames.length > 0 && routeNames.shift();

    logger.verbose('start:', start);
    logger.verbose('end:', end);
    logger.verbose('routeName:', routeName);

    if (start) {
        ctx.start = start;
    }
    if (end) {
        ctx.end = end;
    }
    if (routeName) {
        ctx.routeName = routeName;
    }

    return next();
};

const sortNodes = (nodes) => {
    let sorted = { startLocations: [], endLocations: [], locations: [], routeNames: [] };
    for (let node of nodes) {
        const bestElement = node.bestElement;

        if (isLocation(bestElement)) {
            if (hasRole(node)) {
                bestElement.role = node.role.value;
                sorted[node.role.value + 'Locations'].push(bestElement);
            } else {
                sorted.locations.push(bestElement);
            }
        }
        if (isRouteName(bestElement)) {
            sorted.routeNames.push(bestElement);
        }
    }
    // cím nélküli esetben felborítja a mondaton belüli sorrendet
    // for (let key in sorted) {
    //     sorted[key] = orderByScore(sorted[key]);
    // }
    return sorted;
};

const isLocation = (element) => {
    return element.type === 'location' || element.type === 'stop' || element.type === 'favourite';
};

const isRouteName = (element) => {
    return element.type === 'routeName';
};

const hasRole = (node) => {
    return node && node.role !== undefined;
};

const orderByScore = (elements) => {
    return elements.sort((a, b) => b.score - a.score);
};