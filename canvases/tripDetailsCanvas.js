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
    start: {
        TEXT_START: 167,
        Y: 146,
        get MAX_WIDTH() {
            return c.canvas.WIDTH - c.start.TEXT_START - 25;
        }
    },
    stop: {
        get TEXT_START() {
            return c.start.TEXT_START;
        },
        Y: 410,
        get MAX_WIDTH() {
            return c.canvas.WIDTH - c.stop.TEXT_START - 25;
        }
    },
    time: {
        TEXT_START: 50,
        Y_TOP: 98,
        Y_BOTTOM: 446
    },
    headsign: {
        START: 137,
        Y: 276
    },
    line: {
        vertical: {
            CENTER: 100,
            START: 124,
            END: 392
        },
        top: {
            get CENTER() {
                return c.line.vertical.START;
            },
            START: 75,
            END: 125
        },
        bottom: {
            get CENTER() {
                return c.line.vertical.END;
            },
            get START() {
                return c.line.top.START;
            },
            get END() {
                return c.line.top.END;
            },
        },
        width: 10
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
    const icon = icons.fromColor(leg.route.color);
    return readFile(`./images/${icon.name}.png`)
        .then(img => {
            const image = new Image;
            image.src = img;
            icon.image = image;
            leg.icon = icon;

            drawBackground(ctx);
            drawStartStop(ctx, leg);
            drawHeadsignRow(ctx, leg);
            drawTime(ctx, leg);
            drawLine(ctx, leg);
        });
};

const drawBackground = (ctx) => {
    ctx.fillStyle = c.color.background;
    ctx.fillRect(0, 0, c.canvas.WIDTH, c.canvas.HEIGHT);
    return;
};

const drawStartStop = (ctx, leg) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';

    const start = formatStopName(ctx, leg.from, c.start.MAX_WIDTH);
    const stop = formatStopName(ctx, leg.to, c.stop.MAX_WIDTH);
    ctx.fillText(start, c.start.TEXT_START, c.start.Y);
    ctx.fillText(stop, c.stop.TEXT_START, c.stop.Y);
    return;
};

const drawHeadsignRow = (ctx, leg) => {
    const icon = leg.icon;
    ctx.drawImage(icon.image, c.headsign.START, c.headsign.Y + icon.start);

    let start = c.headsign.START + icon.image.width + 12;
    ctx.fillStyle = `#${leg.route.color}`;
    ctx.font = c.font.px60.bold;
    ctx.textAlign = 'start';
    ctx.fillText(leg.route.name, start, c.headsign.Y);

    start += ctx.measureText(leg.route.name).width + 15;
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    ctx.fillText('>', start, c.headsign.Y);

    start += ctx.measureText('>').width + 15;
    const maxWidth = c.canvas.WIDTH - start - 25;
    const headsign = formatStopName(ctx, leg.route.headsign, maxWidth);
    ctx.fillText(headsign, start, c.headsign.Y);
    return;
};

const drawTime = (ctx, leg) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px40.semibold;
    ctx.textAlign = 'start';
    
    const startTime = moment(leg.startTime).format('HH:mm');
    const endTime = moment(leg.endTime).format('HH:mm');

    ctx.fillText(startTime, c.time.TEXT_START, c.time.Y_TOP);
    ctx.fillText(endTime, c.time.TEXT_START, c.time.Y_BOTTOM);
    return;
};

const drawLine = (ctx, leg) => {
    ctx.lineWidth = c.line.width;
    ctx.strokeStyle = `#${leg.route.color}`;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(c.line.top.START, c.line.top.CENTER);
    ctx.lineTo(c.line.top.END, c.line.top.CENTER);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(c.line.vertical.CENTER, c.line.vertical.START);
    ctx.lineTo(c.line.vertical.CENTER, c.line.vertical.END);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(c.line.bottom.START, c.line.bottom.CENTER);
    ctx.lineTo(c.line.bottom.END, c.line.bottom.CENTER);
    ctx.stroke();
    return;
};