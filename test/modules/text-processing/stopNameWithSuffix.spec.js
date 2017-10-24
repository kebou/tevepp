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
    .use(require('../../../modules/text-processing/stopNameWithSuffix'));

describe('#stopNameWithSuffix module', () => {
    it('should match start stop', (done) => {
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
    it('should match end stop', (done) => {
        tp.process('Albertfalva utcaba')
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
    it('should match multiple stops', (done) => {
        tp.process('albertfalva utcabol blaha lujza terig petofi hidig')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(3);
                const location1 = context.locations[0];
                location1.should.have.property('type').with.to.equal('stop');
                location1.should.have.property('role').with.to.equal('start');
                location1.should.have.property('tokens').with.to.be.a('array');
                location1.value.should.have.property('rawName').with.to.equal('Albertfalva utca');

                const location2 = context.locations[1];
                location2.should.have.property('type').with.to.equal('stop');
                location2.should.have.property('role').with.to.equal('end');
                location2.should.have.property('tokens').with.to.be.a('array');
                location2.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');

                const location3 = context.locations[2];
                location3.should.have.property('type').with.to.equal('stop');
                location3.should.have.property('role').with.to.equal('end');
                location3.should.have.property('tokens').with.to.be.a('array');
                location3.value.should.have.property('rawName').with.to.equal('Petőfi híd, budai hídfő');
            })
            .then(done, done);
    });
});