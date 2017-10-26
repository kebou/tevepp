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
    .use(require('../../../modules/text-processing/addressWithSuffix'));

describe('#addressWithNumber module', () => {
    it('should match simple location with suffix', (done) => {
        tp.process('etele út 19be')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('role').with.to.equal('end');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithSuffix');
                location.value.should.have.property('title').with.to.equal('Budapest, Etele út 19.');
            })
            .then(() => tp.process('móricz zsigmond körtér 2-ből'))
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('role').with.to.equal('start');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithSuffix');
                location.value.should.have.property('title').with.to.equal('Budapest, Móricz Zsigmond körtér 2.');
            })
            .then(() => tp.process('wass albert 12-höz'))
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('role').with.to.equal('end');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithSuffixPartial');
                location.value.should.have.property('title').with.to.equal('Budapest, Wass Albert tér 12.');
            })
            .then(done, done);
    });

    it('should match multiple locations with suffix', (done) => {
        tp.process('országház utca 6ba népfürdő utca 4ből')
            .then(() => {
                console.log(context.locations[0].string)
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(2);

                const location1 = context.locations[0];
                location1.should.have.property('type').with.to.equal('location');
                location1.should.have.property('role').with.to.equal('start');
                location1.should.have.property('tokens').with.to.be.a('array');
                location1.should.have.property('source').with.to.equal('addressWithSuffix');
                location1.value.should.have.property('title').with.to.equal('Budapest, Népfürdő utca 4.');

                const location2 = context.locations[1];
                location2.should.have.property('type').with.to.equal('location');
                location2.should.have.property('role').with.to.equal('end');
                location2.should.have.property('tokens').with.to.be.a('array');
                location2.should.have.property('source').with.to.equal('addressWithSuffix');
                location2.value.should.have.property('title').with.to.equal('Budapest, Országház utca 6.');
            })
            .then(done, done);
    });
});