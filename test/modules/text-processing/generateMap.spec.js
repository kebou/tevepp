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

tp.use(revealCtx)
    .use(require('../../../modules/text-processing/parseText'))
    .use(require('../../../modules/text-processing/generateMap'));


describe('#generateMap module', () => {
    it('should work', (done) => {
        tp.process('hogyan BME-re fehérváriból', { user: { locations }, MAX_WORD_NUMBER: 5 })
            .then(() => {
                console.log(context.map[1][1])
                console.log(context.map[2][2])
                //context.map.map(x => x.map(y => console.log(y)));
            })
            .then(done, done);
    });
});

const locations = [{
    '_id' : '0101',
    'updatedAt' : '2017-10-18T10:25:17.467Z',
    'title' : 'Budapest, Műegyetem rakpart 5.',
    'latitude' : 47.4806205,
    'longitude' : 19.0559823,
    'city' : 'Budapest',
    'streetName' : 'Műegyetem rakpart',
    'streetNumber' : '5',
    'zipCode' : 1111,
    'name' : 'BME',
    'userId' : 111,
    'type' : 'favourite',
    '__v' : 0,
    'createdAt' : '2017-10-18T10:25:17.467Z'
},
{
    '_id' : '0102',
    'updatedAt' : '2017-10-18T15:44:20.587Z',
    'title' : 'Budapest, Fehérvári út 199.',
    'latitude' : 47.449869,
    'longitude' : 19.037322,
    'city' : 'Budapest',
    'streetName' : 'Fehérvári út',
    'streetNumber' : '199',
    'zipCode' : 1116,
    'name' : 'Fehérvári',
    'userId' : 111,
    'type' : 'favourite',
    '__v' : 0,
    'createdAt' : '2017-10-18T15:44:20.587Z'
}];