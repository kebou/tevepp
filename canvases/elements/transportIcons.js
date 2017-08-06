'use strict';

module.exports.fromColor = (routeColor) => {
    switch (routeColor) {
        case 'FFD800': return transportIcons.TRAM;
        case '009FE3': return transportIcons.BUS;
        case 'F01041': return transportIcons.TROLLEYBUS;
        case '1E1E1E': return transportIcons.NIGHTLINE;
        case 'E41F18': return transportIcons.M2;
        case '005CA5': return transportIcons.M3;
        case '4CA22F': return transportIcons.M4;
        case '821066': return transportIcons.H5;
        case '824B00': return transportIcons.H6;
        case 'EE7203': return transportIcons.H7;
        case 'ED677E': return transportIcons.H89;
        case 'D60080': return transportIcons.D11;
        case '981B1E': return transportIcons.D12;
        default: return transportIcons.NIGHTLINE;
    }
};

module.exports.fromType = (type) => {
    if (transportIcons.hasOwnProperty(type)) {
        return transportIcons[type];
    }
    return null;
};

const transportIcons = {
    TRAM: { name: 'TRAM_icon', color: 'FFD800', start: -53 },
    BUS: { name: 'BUS_icon', color: '009FE3', start: -45 },
    TROLLEYBUS: { name: 'TROLLEYBUS_icon', color: 'F01041', start: -60 },
    NIGHTLINE: { name: 'NIGHTLINE_icon', color: '1E1E1E', start: -45 },
    M1: { name: 'M1_icon', color: 'FFD800', start: -51 },
    M2: { name: 'M2_icon', color: 'E41F18', start: -51 },
    M3: { name: 'M3_icon', color: '005CA5', start: -51 },
    M4: { name: 'M4_icon', color: '4CA22F', start: -51 },
    H5: { name: 'H5_icon', color: '821066', start: -52 },
    H6: { name: 'H6_icon', color: '824B00', start: -52 },
    H7: { name: 'H7_icon', color: 'EE7203', start: -52 },
    H89: { name: 'H89_icon', color: 'ED677E', start: -52 },
    D11: { name: 'D11_icon', color: 'D60080', start: -45 },
    D12: { name: 'D12_icon', color: '981B1E', start: -45 },
    D14: { name: 'D14_icon', color: 'D60080', start: -45 }
};