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
    it('should match simple location with number', (done) => {
        tp.process('hogy jutok ide: Váci út 16.')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithNumber');
                location.value.should.have.property('title').with.to.equal('Budapest, Váci út 16.');
            })
            .then(() => tp.process('nádastó park 5'))
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithNumber');
                location.value.should.have.property('title').with.to.equal('Budapest, Nádastó park 5.');
            })
            .then(() => tp.process('Mogyoródi út 5'))
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithNumber');
                location.value.should.have.property('title').with.to.equal('Budapest, Mogyoródi út 5.');
            })
            .then(done, done);
    });

    it('should match partial location with number', (done) => {
        tp.process('Damjanich 18')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithNumberPartial');
                location.value.should.have.property('title').with.to.equal('Budapest, Damjanich utca 18.');
            })
            .then(() => tp.process('bartók 55'))
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(1);
                const location = context.locations[0];
                location.should.have.property('type').with.to.equal('location');
                location.should.have.property('tokens').with.to.be.a('array');
                location.should.have.property('source').with.to.equal('addressWithNumberPartial');
                location.value.should.have.property('title').with.to.equal('Budapest, Bartók Béla út 55.');
            })
            .then(done, done);
    });

    it('should match multiple locations', (done) => {
        tp.process('fehervari ut 199 levay utca 8')
            .then(() => {
                context.should.have.property('locations').with.to.be.a('array').with.to.have.lengthOf(2);
                
                const location1 = context.locations[0];
                location1.should.have.property('type').with.to.equal('location');
                location1.should.have.property('tokens').with.to.be.a('array');
                location1.should.have.property('source').with.to.equal('addressWithNumber');
                location1.value.should.have.property('title').with.to.equal('Budapest, Fehérvári út 199.');

                const location2 = context.locations[1];
                location2.should.have.property('type').with.to.equal('location');
                location2.should.have.property('tokens').with.to.be.a('array');
                location2.should.have.property('source').with.to.equal('addressWithNumber');
                location2.value.should.have.property('title').with.to.equal('Budapest, Lévay utca 8.');
            })
            .then(done, done);
    });
});