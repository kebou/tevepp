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
    .use(require('../../../modules/text-processing/addressWithNumber'));

describe('#addressWithNumber module', () => {
    it('should match Fehérvári út 199.', (done) => {
        tp.process('fehervari ut 199 levay utca 8')
            .then(() => {
                console.log(context.locations);
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.value.should.have.property('title').with.to.equal('Budapest, Fehérvári út 199.');
            })
            .then(done, done);
    });
});