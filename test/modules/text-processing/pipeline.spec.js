'use strict';
const chai = require('chai');
const should = require('chai').should();
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

const TextProcessor = require('../../../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

const printContext = (ctx) => {
    console.log('\n##################################');
    console.log('TEXT:', context.emagyar.text);
    console.log('##################################\n\n');
    printLocations(ctx.locations);
    console.log('\n\n');
    printRouteNames(ctx.routeNames);
    console.log('\n--------------------------------------------------------\n')
};

tp.use(revealCtx)
    .use(require('../../../modules/text-processing/parseText'))
    .use(require('../../../modules/text-processing/stopNameMorph'))
    .use(require('../../../modules/text-processing/stopNameWithSuffix'))
    .use(require('../../../modules/text-processing/stopNameFromEnd'))
    .use(require('../../../modules/text-processing/stopNameFromStart'))
    .use(require('../../../modules/text-processing/routeName'))
    .use(require('../../../modules/text-processing/addressWithNumber'))
    .use(require('../../../modules/text-processing/addressWithSuffix'))
    .use(printContext);


describe('Text Processing Pipeline', () => {
    it('should do something', (done) => {
        tp.process('Széll Kálmán térről Solymárra')
            .then(() => tp.process('virág utca 6ba népfürdő utca 10ből'))
            .then(() => tp.process('szena ter 6os'))
            .then(() => tp.process('infopark 1'))
            .then(() => tp.process('moriczrol kerepesi 29-be'))
            .then(done, done);
    });
});

const printLocations = (locations) => {
    console.log('            Locations');
    console.log('##################################');
    if (!locations || locations.length < 1) {
        console.log('N/A');
        return;
    }
    return locations.map(location => {
        let title = '';
        if (location.type === 'location') {
            title = location.value.title;
        } else if (location.type === 'stop') {
            title = location.value.rawName;
        }
        console.log('• TITLE:', title);
        console.log('• MATCH:', location.string);
        console.log('• TYPE:', location.type);
        console.log('• SOURCE:', location.source);
        console.log('• ROLE:', location.role);
        if (location.partial) {
            console.log('• PARTIAL:', location.partial);
        }
        printTokens(location.tokens);
        console.log('\n              ...\n');
    });
};

const printRouteNames = (routeNames) => {
    console.log('          Route Names');
    console.log('##################################');
    return routeNames && routeNames.map(routeName => {
        console.log('• VALUE:', routeName.value);
        console.log('• SOURCE:', routeName.source);
        printTokens(routeName.tokens);
    });
};

const printTokens = (tokens) => {
    console.log('• TOKENS', `(${tokens.length})`);
    return tokens && tokens.map(token => {
        console.log('   - Id:', token.id, ', Content:', (token.custom || token.content));
    });
};