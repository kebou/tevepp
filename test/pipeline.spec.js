'use strict';
const chai = require('chai');
//chai.use(require('chai-as-promised'));
const should = require('chai').should();
const mongoose = require('mongoose');

const config = require('config');
const MONGO_URL = process.env.MONGO_URL || config.get('mongoURL');
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL);

const TextProcessor = require('../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx);
tp.use(require('../modules/text-processing/matchRouteName'));
tp.use(require('../modules/text-processing/parseText'));
tp.use(require('../modules/text-processing/findStopName'));
tp.use(require('../modules/text-processing/findStopNameWithoutAccent'));

describe('Text Processing Pipeline', function () {
    describe('Route Name Matching', function () {
        it('should match H5', function (done) {
            tp.process('H5')
                .then(() => {
                    context.should.have.property('routeName').with.to.deep.equal('H5');
                })
                .then(done, done);
        });
        it('should match 149-es', function (done) {
            tp.process('149-es')
                .then(() => {
                    context.should.have.property('routeName').with.to.equal('149');
                })
                .then(done, done);
        });
        it('should match 5-os', function (done) {
            tp.process('5-os')
                .then(() => {
                    context.should.have.property('routeName').with.to.equal('5');
                })
                .then(done, done);
        });
        it('should not match 29-be', function (done) {
            tp.process('29-be')
                .then(() => {
                    context.should.have.not.property('routeName');
                })
                .then(done, done);
        });
        it('should not match 17bol', function (done) {
            tp.process('17bol')
                .then(() => {
                    context.should.have.not.property('routeName');
                })
                .then(done, done);
        });
        it('should not match H55', function (done) {
            tp.process('H55')
                .then(() => {
                    context.should.not.have.property('routeName');
                })
                .then(done, done);
        });
    });

    describe('Stop Name Parser', function () {
        it('should parse moriczrol as Móricz Zsigmond körtér for start', function (done) {
            tp.process('moriczrol')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.should.have.property('raw').with.to.be.a('array');
                    context.start.value.should.have.property('rawName').with.to.equal('Móricz Zsigmond körtér');
                })
                .then(done, done);
        });
        it('should parse blahara as Blaha Lujza tér for end', function (done) {
            tp.process('blahara')
                .then(() => {
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.should.have.property('raw').with.to.be.a('array');
                    context.end.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');
                })
                .then(done, done);
        });
        it('should parse Széll Kálmán térről as Széll Kálmán tér for start', function (done) {
            tp.process('Széll Kálmán térről')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.should.have.property('raw').with.to.be.a('array');
                    context.start.value.should.have.property('rawName').with.to.equal('Széll Kálmán tér');
                })
                .then(done, done);
        });
    });

    describe('Departures', function () {
        it('should send M2 departures from Déli pályaudvar', function (done) {
            tp.process('delibol M2')
            .then(() => {
                context.should.have.property('start');
                context.start.should.have.property('value');
                context.start.should.have.property('type').with.to.equal('stop');
                context.start.value.should.have.property('rawName').with.to.equal('Déli pályaudvar');
                context.should.have.property('routeName').with.to.equal('M2');
            })
            .then(done, done);
        });
    });

    describe('Trip Planning', function () {
        it('should plan a trip between Blaha Lujza tér and Móricz Zsigmond körtér', function (done) {
            tp.process('blaharol moriczra')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.value.should.have.property('rawName').with.to.equal('Móricz Zsigmond körtér');
                })
                .then(done, done);
        });
        it('should plan a trip between József Attila utca and Albertfalva utca', function (done) {
            tp.process('József Attila utcából Albertfalva utcába')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.should.have.property('raw').with.to.be.a('array');
                    context.start.value.should.have.property('rawName').with.to.equal('József Attila utca');
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.should.have.property('raw').with.to.be.a('array');
                    context.end.value.should.have.property('rawName').with.to.equal('Albertfalva utca');
                })
                .then(done, done);
        });
    });
});