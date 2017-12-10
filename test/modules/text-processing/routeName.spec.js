'use strict';
const chai = require('chai');
const should = require('chai').should();

const TextProcessor = require('../../../modules/text-processing/textProcessor');
const tp = new TextProcessor();

let context;
const revealCtx = (ctx, next) => {
    context = ctx;
    return next();
};

tp.use(revealCtx)
    .use(require('../../../modules/text-processing/parseText'))
    .use(require('../../../modules/text-processing/routeName'));


describe('#routeName module', () => {
    it('should match routename', (done) => {
        tp.process('61')
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('61');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(() => tp.process('M3'))
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('M3');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(() => tp.process('133E'))
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('133E');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(done, done);
    });

    it('should match routename with suffix', (done) => {
        tp.process('149-es')
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('149');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(() => tp.process('5-os'))
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('5');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(() => tp.process('H5ös'))
            .then(() => {
                context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(1);

                const routeName = context.routeNames[0];
                routeName.should.have.property('value').with.to.equal('H5');
                routeName.should.have.property('tokens').with.to.be.a('array');
                routeName.should.have.property('source').with.to.equal('routeName');
            })
            .then(done, done);
    });

    it('should not match address', (done) => {
        tp.process('17bol')
            .then(() => {
                context.should.not.have.property('routeNames');
            })
            .then(() => tp.process('8ba'))
            .then(() => {
                context.should.not.have.property('routeNames');
            })
            .then(() => tp.process('29-be'))
            .then(() => {
                context.should.not.have.property('routeNames');
            })
            .then(done, done);
    });

    it('should match multiple routenames', (done) => {
        tp.process('28, 212es 25ös M2-es H7-es')
        .then(() => {
            context.should.have.property('routeNames').with.to.be.a('array').with.to.have.lengthOf(5);

            const routeName1 = context.routeNames[0];
            routeName1.should.have.property('value').with.to.equal('28');
            routeName1.should.have.property('tokens').with.to.be.a('array');
            routeName1.should.have.property('source').with.to.equal('routeName');

            const routeName2 = context.routeNames[1];
            routeName2.should.have.property('value').with.to.equal('212');
            routeName2.should.have.property('tokens').with.to.be.a('array');
            routeName2.should.have.property('source').with.to.equal('routeName');

            const routeName3 = context.routeNames[2];
            routeName3.should.have.property('value').with.to.equal('25');
            routeName3.should.have.property('tokens').with.to.be.a('array');
            routeName3.should.have.property('source').with.to.equal('routeName');

            const routeName4= context.routeNames[3];
            routeName4.should.have.property('value').with.to.equal('M2');
            routeName4.should.have.property('tokens').with.to.be.a('array');
            routeName4.should.have.property('source').with.to.equal('routeName');

            const routeName5 = context.routeNames[4];
            routeName5.should.have.property('value').with.to.equal('H7');
            routeName5.should.have.property('tokens').with.to.be.a('array');
            routeName5.should.have.property('source').with.to.equal('routeName');
        })
        .then(done, done);
    });
});