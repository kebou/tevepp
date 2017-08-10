'use strict';
const Canvas = require('canvas');
const Image = Canvas.Image;
const Font = Canvas.Font;
const bp = require('bluebird');
const readFile = bp.promisify(require('fs').readFile);
const icons = require('./elements/transportIcons');
const formatStopName = require('../utils/formatStopName');

if (!Font) throw new Error('Need to compile with font support');
//function fontFile (name) { return path.join(__dirname, '/font/SF-UI-Display', name) }
//Canvas.registerFont(__dirname + '/SF-UI-Display/SF-UI-Display-Bold.ttf', {family: 'SFUIDisplay', weight: 'bold'});


const localConstants = {
    routeName: {
        TEXT_START: 88,
        TEXT_CENTER: 140
    },
    headsign: {
        TEXT_START: 262,
        TEXT_START_SHORT: 305,
        get MAX_WIDTH() {
            return c.canvas.WIDTH - c.headsign.TEXT_START - 25;
        },
        get MAX_WIDTH_SHORT() {
            return c.canvas.WIDTH - c.headsign.TEXT_START_SHORT - 25;
        }
    },
    separator: {
        TEXT_START: 214,
        TEXT_START_SHORT: 257
    },
    line: {
        START: 25,
        get END() {
            return c.canvas.WIDTH - c.line.START;
        },
        base(rows) {
            if (rows === 3) return 174;
            if (rows === 2) return 252;
            return c.line.BASE;
        },
        BASE: 135
    },
    icon: {
        START: 33
    },
    rows: {
        spacing: (rows) => {
            if (rows === 3) return 156;
            if (rows === 2) return 234;
            return c.rows.SPACING;
        },
        MAX: 4,
        NUMBER: 4,
        SPACING: 117
    },
    text: {
        base: (rows) => {
            if (rows === 3) return 117;
            if (rows === 2) return 156;
            if (rows === 1) return 273;
            return c.text.BASE;
        },
        BASE: 98
    }
};
const c = Object.assign({}, require('./elements/constants'), localConstants);

module.exports = (legs) => {
    // tömb elemeinek csökkentése a maximálisan megengedettre
    legs.splice(c.rows.MAX, legs.length - c.rows.MAX);
    const canvas = new Canvas(c.canvas.WIDTH, c.canvas.HEIGHT);
    const ctx = canvas.getContext('2d');
    return drawCanvas(ctx, legs)
        .then(() => canvas.toBuffer());
};

const drawCanvas = (ctx, legs) => {
    drawBackground(ctx);
    return legs.reduce((prev, leg, idx, legs) => {
        return prev.then(() => drawRow(ctx, leg, idx, legs.length));
    }, Promise.resolve());
};

const drawRow = (ctx, leg, idx, rows) => {
    const icon = icons.fromColor(leg.route.color);
    return readFile(`./images/${icon.name}.png`)
        .then(img => {
            const image = new Image;
            image.src = img;
            icon.image = image;
            leg.icon = icon;

            drawIcon(ctx, leg, idx, rows);
            drawRouteName(ctx, leg, idx, rows);
            drawSeparator(ctx, leg, idx, rows);
            drawHeadsign(ctx, leg, idx, rows);
            drawLine(ctx, leg, idx, rows);
            return Promise.resolve();
        });
};

const drawBackground = (ctx) => {
    ctx.fillStyle = c.color.background;
    ctx.fillRect(0, 0, c.canvas.WIDTH, c.canvas.HEIGHT);
    return;
};

const drawIcon = (ctx, leg, idx, rows) => {
    const icon = leg.icon;
    ctx.drawImage(icon.image, c.icon.START, c.text.base(rows) + idx * c.rows.spacing(rows) + icon.start);
    return;
};

const drawRouteName = (ctx, leg, idx, rows) => {
    let textAlign, textStart;
    if (leg.route.name.length > 3) { textAlign = 'start'; textStart = c.routeName.TEXT_START }
    else { textAlign = 'center'; textStart = c.routeName.TEXT_CENTER }

    ctx.fillStyle = `#${leg.route.color}`;
    ctx.font = c.font.px60.bold;
    ctx.textAlign = textAlign;
    ctx.fillText(leg.route.name, textStart, c.text.base(rows) + idx * c.rows.spacing(rows));
    return;
};

const drawSeparator = (ctx, leg, idx, rows) => {
    let textStart;
    if (leg.route.name.length > 3) { textStart = c.separator.TEXT_START_SHORT }
    else { textStart = c.separator.TEXT_START }

    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    ctx.fillText('>', textStart, c.text.base(rows) + idx * c.rows.spacing(rows));
    return;
};

const drawHeadsign = (ctx, leg, idx, rows) => {
    let textStart, maxWidth;
    if (leg.route.name.length > 3) { textStart = c.headsign.TEXT_START_SHORT; maxWidth = c.headsign.MAX_WIDTH_SHORT }
    else { textStart = c.headsign.TEXT_START; maxWidth = c.headsign.MAX_WIDTH }

    ctx.fillStyle = c.color.text;
    ctx.font = c.font.px60.light;
    ctx.textAlign = 'start';
    const headsign = formatStopName(ctx, leg.to, maxWidth);
    ctx.fillText(headsign, textStart, c.text.base(rows) + idx * c.rows.spacing(rows));
    return;
};

const drawLine = (ctx, leg, idx, rows) => {
    if (!(idx < rows - 1)) return;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = c.color.text;

    ctx.beginPath();
    ctx.moveTo(c.line.START, c.line.base(rows) + idx * c.rows.spacing(rows));
    ctx.lineTo(c.line.END, c.line.base(rows) + idx * c.rows.spacing(rows));
    ctx.stroke();
    return;
};
