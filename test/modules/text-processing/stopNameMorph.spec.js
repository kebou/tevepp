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
    .use(require('../../../modules/text-processing/stopNameMorph'));

describe('#stopNameMorph module', () => {
    it('should match Széll Kálmán tér', (done) => {
        tp.process('Széll Kálmán térről')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('stop');
                location.should.have.property('role').with.to.equal('start');
                location.should.have.property('tokens').with.to.be.a('array');
                location.value.should.have.property('rawName').with.to.equal('Széll Kálmán tér');
            })
            .then(done, done);
    });
    it('should match Albertfalva utca', (done) => {
        tp.process('Albertfalva utcába')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('stop');
                location.should.have.property('role').with.to.equal('end');
                location.should.have.property('tokens').with.to.be.a('array');
                location.value.should.have.property('rawName').with.to.equal('Albertfalva utca');
            })
            .then(done, done);
    });
    it.skip('should match Blaha Lujza tér', (done) => {
        tp.process('Blaha Lujza térhez')
            .then(() => {
                //console.log('context:', context);
            })
            .then(done, done);
    });
});