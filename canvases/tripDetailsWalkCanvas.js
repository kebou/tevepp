'use strict';
const Canvas = require('canvas');
const Image = Canvas.Image;
const Font = Canvas.Font;
const bp = require('bluebird');
const readFile = bp.promisify(require('fs').readFile);
const icons = require('./elements/transportIcons');
const formatStopName = require('../utils/formatStopName');
const moment = require('moment');

if (!Font) throw new Error('Need to compile with font support');

const localConstants = {
    icon: {
        X: 85,
        Y: 120
    },
    address: {
        TEXT_START: 425,
        Y: 272
    },
    separator: {
        TEXT_START: 375,
        get Y() {
            return c.address.Y;
        }
    }
};
const c = Object.assign({}, require('./elements/constants'), localConstants);

module.exports = (leg) => {
    const canvas = new Canvas(c.canvas.WIDTH, c.canvas.HEIGHT);
    const ctx = canvas.getContext('2d');
    return drawCanvas(ctx, leg)
        .then(() => canvas.toBuffer());
};

const drawCanvas = (ctx, leg) => {
    return readFile('./images/WALK_icon.png')
        .then(img => {
            const icon = new Image;
            icon.src = img;

            drawBackground(ctx);
            drawIcon(ctx, icon);
            drawSeparator(ctx);
            drawAddress(ctx, leg);
        });
};

const drawBackground = (ctx) => {
    ctx.fillStyle = c.color.background;
    ctx.fillRect(0, 0, c.canvas.WIDTH, c.canvas.HEIGHT);
    return;
};

const drawIcon = (ctx, icon) => {
    ctx.drawImage(icon, c.icon.X, c.icon.Y);
    return;
};

const drawSeparator = (ctx) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    ctx.fillText('>', c.separator.TEXT_START, c.separator.Y);
    return;
};

const drawAddress = (ctx, leg) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    const maxWidth = c.canvas.WIDTH - c.address.TEXT_START - 25;
    const address = formatStopName(ctx, { rawName:  leg.to.title, shortName: leg.to.title }, maxWidth);
    ctx.fillText(address, c.address.TEXT_START, c.address.Y);
    return;
};