'use strict';
const chai = require('chai');
//chai.use(require('chai-as-promised'));
const should = require('chai').should();
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

const TextProcessor = require('../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx);

tp.use(require('../modules/text-processing/parseText'));

tp.use(require('../modules/text-processing/findStopNameWithMorph'));
tp.use(require('../modules/text-processing/findStopNameWithoutAccent'));
tp.use(require('../modules/text-processing/findAddressWithSuffix'));
tp.use(require('../modules/text-processing/matchRouteName'));
tp.use(require('../modules/text-processing/findAddressWithNumber'));
tp.use(require('../modules/text-processing/findStopNameWithoutSuffix'));

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
        it('should not match 8ba', function (done) {
            tp.process('8ba')
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
                    context.start.should.have.property('tokens').with.to.be.a('array');
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
                    context.end.should.have.property('tokens').with.to.be.a('array');
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
                    context.start.should.have.property('tokens').with.to.be.a('array');
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

        it('should send 1 departures from Infopark', function (done) {
            tp.process('infoparkbol 1')
            .then(() => {
                context.should.have.property('start');
                context.start.should.have.property('value');
                context.start.should.have.property('type').with.to.equal('stop');
                context.start.value.should.have.property('rawName').with.to.equal('Infopark');
                context.should.have.property('routeName').with.to.equal('1');
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
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    context.start.value.should.have.property('rawName').with.to.equal('József Attila utca');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('rawName').with.to.equal('Albertfalva utca');
                })
                .then(done, done);
        });
        it('should plan a trip between Móricz Zsigmond körtér and Kerepesi út 29.', function (done) {
            tp.process('moriczrol kerepesi 29-be')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Móricz Zsigmond körtér');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Kerepesi út 29.');
                })
                .then(done, done);
        });
        it('should plan a trip between Széll Kálmán tér and Solymár', function (done) {
            tp.process('Széll Kálmán térről Solymárra')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Széll Kálmán tér');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Solymár');
                })
                .then(done, done);
        });
        it('should plan a trip between Blaha Lujza tér and Albertfalva utca 199.', function (done) {
            tp.process('blaharol albertfalva utca 17be')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Albertfalva utca 17.');
                })
                .then(done, done);
        });
        it('should plan a trip between Batthyány utca 48. and Országház utca 5.', function (done) {
            tp.process('batthyány utca 48bol orszaghaz utca 5be')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('location');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    context.start.value.should.have.property('title').with.to.equal('Budapest, Batthyány utca 48.');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Országház utca 5.');
                })
                .then(done, done);
        });
        it('should plan a trip between Népfürdő utca 10. and Virág utca 6.', function (done) {
            tp.process('virág utca 6ba népfürdő utca 10ből')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('location');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    context.start.value.should.have.property('title').with.to.equal('Budapest, Népfürdő utca 10.');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Virág utca 6.');
                })
                .then(done, done);
        });
        it('should plan a trip between Blaha Lujza tér and Móricz Zsigmond körtér', function (done) {
            tp.process('blaha moricz')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.value.should.have.property('rawName').with.to.equal('Móricz Zsigmond körtér');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                })
                .then(done, done);
        });
        it.skip('should plan a trip between Moszkva tér and Nyugati pályaudvar', function (done) {
            tp.process('moszkva tér nyugati')
                .then(() => {
                    console.log(context);
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Blaha Lujza tér');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('stop');
                    context.end.value.should.have.property('rawName').with.to.equal('Nyugati pályaudvar');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                })
                .then(done, done);
        });
        it('should match kerepesi 29 as end', function (done) {
            tp.process('kerepesi 29')
                .then(() => {
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Kerepesi út 29.');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                })
                .then(done, done);
        });
        it('should plan a trip between Fehérvári út 199. and Lévay utca 8.', function (done) {
            this.timeout(3000);
            tp.process('fehervari ut 199 levay utca 8')
                .then(() => {
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('location');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    context.start.value.should.have.property('title').with.to.equal('Budapest, Fehérvári út 199.');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Lévay utca 8.');
                })
                .then(done, done);
        });
        it('should plan a trip between Ferenciek tere and Nádastó park 5.', function (done) {
            this.timeout(3000);
            tp.process('ferenciek nádastó park 5')
                .then(() => {
                    console.log(context);
                    context.should.have.property('start');
                    context.start.should.have.property('value');
                    context.start.should.have.property('type').with.to.equal('stop');
                    context.start.value.should.have.property('rawName').with.to.equal('Ferenciek tere');
                    context.start.should.have.property('tokens').with.to.be.a('array');
                    
                    context.should.have.property('end');
                    context.end.should.have.property('value');
                    context.end.should.have.property('type').with.to.equal('location');
                    context.end.should.have.property('tokens').with.to.be.a('array');
                    context.end.value.should.have.property('title').with.to.equal('Budapest, Nádastó park 5.');
                })
                .then(done, done);
        });
    });
});