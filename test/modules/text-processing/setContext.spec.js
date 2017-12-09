'use strict';
/* eslint-disable no-undef*/
const chai = require('chai');   // eslint-disable-line no-unused-vars
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

const TextProcessor = require('../../../modules/text-processing/textProcessor');
const tp = new TextProcessor();

const partitions = require('./partitions.json');

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx)
    // .use(require('../../../modules/text-processing/parseText'))
    // .use(require('../../../modules/text-processing/generateMap'))
    // .use(require('../../../modules/text-processing/rankPartitions'))
    .use(require('../../../modules/text-processing/setContext'))
    .use(require('../../../modules/text-processing/returnContext'));


const tpObject = {
    user: {},
    MAX_WORD_NUMBER: 5,
    partitions
};

describe('#setContext module', () => {
    it('albertfalva utca 27 móriczról', (done) => {
        tp.process('albertfalva utca 27 móriczról', tpObject)
            .then(ctx => {
                // ctx.should.have.property('map');
                // ctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);
                // const { partitions } = ctx;
                // const bestMatch = partitions[0];
                // bestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);
                // const bestNodes = bestMatch.nodes;
                // bestNodes.should.to.have.lengthOf(2);
                // bestNodes[0].text.should.have.to.equal('albertfalva utca 27');
                // bestNodes[1].text.should.have.to.equal('fehérvári');
                //console.log(ctx.partitions[0].rank);
                //console.log(ctx.partitions[0].nodes);
            })
            .then(done, done);
    });
});