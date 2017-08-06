'use strict';

module.exports = (ctx, name, width) => {
    const rawNameWidth = ctx.measureText(name.rawName).width;
    if (rawNameWidth <= width) {
        return name.rawName;
    }
    const shortNameWidth = ctx.measureText(name.shortName).width;
    if (shortNameWidth <= width) {
        return name.shortName;
    }

    const dotWidth = ctx.measureText('.').width;
    const allChars = 'aábcdefghiíjklmnoóöőpqrstuúüűvwxyz';
    const averageCharWidth = ctx.measureText(allChars).width / allChars.length;

    const widthDifference = rawNameWidth - width + dotWidth;
    const characterDifference = Math.round(widthDifference / averageCharWidth);
    const size = name.rawName.length - characterDifference;

    return name.rawName.slice(0, size - 1) + '.';
};