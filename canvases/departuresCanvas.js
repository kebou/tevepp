'use strict';
const Canvas = require('canvas');
const Font = Canvas.Font;
const formatStopName = require('../utils/formatStopName');
const moment = require('moment');

if (!Font) throw new Error('Need to compile with font support');

const localConstants = {
    routeName: {
        TEXT_START: 33,
        TEXT_END: 138,
        TEXT_END_CHAR: 181
    },
    headsign: {
        TEXT_START: 203,
        get MAX_WIDTH() {
            return c.time.TEXT_END - c.headsign.TEXT_START - 10;
        }
    },
    time: {
        get TEXT_END() {
            return c.canvas.WIDTH - 25;
        }
    },
    line : {
        BASE: 135,
        get START() {
            return c.headsign.TEXT_START;
        },
        get END() {
            return c.time.TEXT_END;
        }
    }
};
const c = Object.assign({}, require('./elements/constants'), localConstants);

module.exports = (data) => {
    // tömb elemeinek csökkentése a maximálisan megengedettre
    data.splice(c.rows.MAX, data.length - c.rows.MAX);

    const canvas = new Canvas(c.canvas.WIDTH, c.canvas.HEIGHT);
    const ctx = canvas.getContext('2d');
    return drawCanvas(ctx, data)
        .then(() => canvas.toBuffer());
};

const drawCanvas = (ctx, data) => {
    drawBackground(ctx);
    return data.reduce((prev, cur, idx, data) => {
        return prev.then(() => drawRow(ctx, cur, idx, data.length));
    }, Promise.resolve());
};

const drawRow = (ctx, cur, idx, rows) => {
    drawRouteName(ctx, cur, idx, rows);
    drawHeadsign(ctx, cur, idx, rows);
    drawTime(ctx, cur, idx, rows);
    drawLine(ctx, cur, idx, rows);
    return Promise.resolve();
};

const drawBackground = (ctx) => {
    ctx.fillStyle = c.color.background;
    ctx.fillRect(0, 0, c.canvas.WIDTH, c.canvas.HEIGHT);
    return;
};

const drawRouteName = (ctx, departure, idx, rows) => {
    let textAlign, textStart;
    if (departure.route.name > 3) { textAlign = 'start'; textStart = c.routeName.TEXT_START }
    else if (isNaN(parseInt(departure.route.name.slice(-1)))) { textAlign = 'end'; textStart = c.routeName.TEXT_END_CHAR }
    else { textAlign = 'end'; textStart = c.routeName.TEXT_END }

    ctx.fillStyle = `#${departure.route.color}`;
    ctx.font = c.font.px60.bold;
    ctx.textAlign = textAlign;
    ctx.fillText(departure.route.name, textStart, c.text.BASE + idx * c.rows.SPACING);
    return;
};

const drawHeadsign = (ctx, departure, idx, rows) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    const maxWidth = c.headsign.MAX_WIDTH - Math.round(ctx.measureText(getTime(departure.timestamp)).width);
    const headsign = formatStopName(ctx, departure.route.headsign, maxWidth);
    ctx.fillText(headsign, c.headsign.TEXT_START, c.text.BASE + idx * c.rows.SPACING);
    return;
};

const drawTime = (ctx, departure, idx, rows) => {
    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'end';
    ctx.fillText(getTime(departure.timestamp), c.time.TEXT_END, c.text.BASE + idx * c.rows.SPACING);
};

const drawLine = (ctx, leg, idx, rows) => {
    if (!(idx < rows - 1)) return;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = c.color.black;

    ctx.beginPath();
    ctx.moveTo(c.line.START, c.line.BASE + idx * c.rows.SPACING);
    ctx.lineTo(c.line.END, c.line.BASE + idx * c.rows.SPACING);
    ctx.stroke();
    return;
};

const getTime = (timestamp) => {
    const m = moment(timestamp);
    const minutes = m.diff(moment(), 'minutes');
    if (minutes < 1) return '';
    if (minutes > 59) return m.format('HH:mm');
    return minutes + '’';
};