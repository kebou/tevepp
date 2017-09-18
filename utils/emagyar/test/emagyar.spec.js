'use strict';
const chai = require('chai');
chai.use(require('chai-as-promised'));
const should = require('chai').should();
const emagyar = require('../index');


describe('e-magyar API', function () {
    describe('#parseText()', function () {
        it('should parse simple text', function () {
            return emagyar.parseText('Teve megy az úton.')
                .then(function(res) {
                    res.should.have.property('text').with.to.be.a('string');
                    res.should.have.property('tokens').with.not.lengthOf(0);
                    res.should.have.property('nes').with.lengthOf(0);
                    res.should.have.property('nps').with.lengthOf(2);
                });
        });

        it('should parse simple text with callback', function () {
            emagyar.parseText('Teve megy az úton.', function (err, res) {
                res.should.have.property('text').with.to.be.a('string');
                res.should.have.property('tokens').with.not.lengthOf(0);
                res.should.have.property('sentences').with.to.be.lengthOf(1);
                res.should.have.property('nes').with.lengthOf(0);
                res.should.have.property('nps').with.lengthOf(2);
                err.should.to.be.null;
                done();
            });
        });
    });
});

