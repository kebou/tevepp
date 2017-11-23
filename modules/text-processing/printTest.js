'use strict';
const logger = require('winston');
/**
 * In: text, partitions
 * Out: outputs
 */
module.exports = (ctx, next) => {
    const { text, partitions, test } = ctx;
    if (!text || !partitions) {
        logger.error('#printTest module should be used after "text", "partitions" property in ctx');
        return next();
    }
    if (!test) {
        return next();
    }

    console.log(`it('${text}', (done) => {`);
    console.log(`\ttp.process('${text}', tpObject)`);
    console.log('\t\t.then(ctx => {');
    console.log("\t\t\tctx.should.have.property('map');");
    console.log("\t\t\tctx.should.have.property('partitions').with.to.be.a('array').to.have.lengthOf.at.least(1);");
    console.log('\t\t\tconst { partitions } = ctx;');
    console.log('\t\t\tconst bestMatch = partitions[0];');
    console.log("\t\t\tbestMatch.should.have.property('nodes').with.to.be.a('array').to.have.lengthOf.at.least(1);");
    console.log("\t\t\tconst bestNodes = bestMatch.nodes;");
    
    const nodes = partitions[0].nodes;
    console.log(`\t\t\tbestNodes.should.to.have.lengthOf(${nodes.length});`);
    for (let idx in nodes) {
        console.log(`\t\t\tbestNodes[${idx}].text.should.have.to.equal('${nodes[idx].text}');`);
    }
    console.log('\t\t})');
    console.log('\t\t.then(done, done);');
    console.log('});\n');

    if (next) {
        return next();
    }
    return Promise.resolve();
};