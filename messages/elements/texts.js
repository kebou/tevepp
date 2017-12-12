'use strict';
const round = require('../../utils/round');
const nlg = require('../../utils/nlg');

const moment = require('moment');
moment.locale('hu');


module.exports.greeting = (user) => {
    return user.__(getRandomItem(user, 'greeting.hi'), { name: user.firstName });
};

module.exports.greetUser = (user) => {
    if (user.new) return user.__(getRandomItem(user, 'greeting.newUser'));
    return user.__(getRandomItem(user, 'greeting.oldUser'));
};

module.exports.startHelp = (user) => {
    if (user.new) return user.__('helpSummary');
    return user.__(getRandomItem(user, 'help'));
};

module.exports.farewell = (user) => {
    return user.__(getRandomItem(user, 'greeting.bye'), { name: user.firstName });
};

module.exports.comeBack = (user) => {
    return user.__(getRandomItem(user, 'greeting.comeBack'));
};

module.exports.introduction = (user) => {
    return user.__(getRandomItem(user, 'introduction'));
};

module.exports.emoji = (user) => {
    return user.__(getRandomItem(user, 'emoji'));
};

module.exports.joke = (user) => {
    return user.__(getRandomItem(user, 'joke'));
};

module.exports.help = (user, index) => {
    if (index !== undefined) {
        return user.__('help.' + index);
    }
    return user.__(getRandomItem(user, 'help'));
};

module.exports.allIsWell = (user) => {
    return user.__(getRandomItem(user, 'allIsWell'));
};

module.exports.welcome = (user) => {
    return user.__(getRandomItem(user, 'welcome'));
};

module.exports.outOfScope = (user) => {
    return user.__(getRandomItem(user, 'outOfScope'));
};

const tripPlanning = {};

tripPlanning.walkingDistance = (user) => {
    return user.__('trip.walkingDistance');
};

tripPlanning.searchingTrip = (user, start, stop) => {
    return user.__(getRandomItem(user, 'trip.searchingTrip'), { start: start.title, stop: stop.title });
};

tripPlanning.summaryTitle = (user, tripOption) => {
    const duration = Math.round(tripOption.duration / 60000);
    const from = moment(tripOption.startTime).format('HH:mm');
    const till = moment(tripOption.endTime).format('HH:mm');
    let walkDistance = tripOption.walkDistance;
    const walk = walkDistance >= 1000 ? `${round(walkDistance / 1000, 1)} km` : `${walkDistance} m`;
    return `${user.__n('minute', duration)} • ${from}-${till} • ${walk} ${user.__('walk')}`;
};

tripPlanning.summarySubtitle = (user, stop) => {
    return user.__('startFromStop', { stopName: stop.name });
};

tripPlanning.detailsTitle = (user, leg) => {
    const duration = Math.round(leg.duration / 60000);
    const stops = leg.intermediateStops + 1;
    return `${user.__n('minute', duration)} • ${user.__n('stop', stops)}`;
};

tripPlanning.detailsWalkTitle = (user, leg) => {
    const duration = Math.round(leg.duration / 60000);
    const walkDistance = Math.round(leg.distance);
    const walk = walkDistance >= 1000 ? `${round(walkDistance / 1000, 1)} km` : `${walkDistance} m`;
    return `${user.__n('minute', duration)} • ${walk}`;
};

tripPlanning.failed = (user) => {
    return user.__('trip.tripPlanningFailed');
};

tripPlanning.noTransportService = (user) => {
    return user.__('trip.noService');
};

tripPlanning.askStart = (user) => {
    return user.__(getRandomItem(user, 'trip.askStart'));
};

tripPlanning.askStop = (user) => {
    return user.__(getRandomItem(user, 'trip.askStop'));
};

tripPlanning.canceled = (user) => {
    return user.__(getRandomItem(user, 'trip.canceled'));
};

module.exports.tripPlanning = tripPlanning;

module.exports.locationHint = (user) => {
    return user.__('locationHint');
};

module.exports.invalidLocation = (user) => {
    return user.__('invalidLocation');
};

module.exports.chooseFromQuickReplies = (user) => {
    return user.__('chooseFromQuickReplies');
};

const schedule = {};

schedule.askDirection = (user) => {
    return user.__(getRandomItem(user, 'schedule.direction'));
};

schedule.nextDeparture = (user, routeName, timestamp) => {
    const time = moment(timestamp);
    const minutes = time.diff(moment(), 'minutes');
    if (minutes === 0) {
        return user.__('schedule.withinOneMinute', { routeName: nlg.appendRouteSuffix(user, routeName) });
    }
    if (minutes <= 60) {
        return user.__('schedule.withinXMinutes', { minutes, routeName: nlg.appendRouteSuffix(user, routeName) });
    }
    return user.__('schedule.departAt', { routeName: nlg.appendRouteSuffix(user, routeName), time: time.format('HH:mm') });
};

schedule.invalidStopName = (user) => {
    return user.__('schedule.invalidStopName');
};

schedule.invalidRouteName = (user) => {
    return user.__('schedule.invalidRouteName');
};

schedule.invalidRouteStopPair = (user, stop, route) => {
    const routeName = nlg.appendArticle(user, nlg.appendRouteSuffix(user, route.name));
    const stopName = nlg.appendArticle(user, stop.rawName);
    const transportType = user.__(`transportType.${route.type}`);
    return user.__('schedule.invalidRouteStopPair', { routeName: nlg.capitalize(routeName), stopName, transportType });
};

schedule.askStop = (user) => {
    return user.__(getRandomItem(user, 'schedule.askStop'));
};

schedule.canceled = (user) => {
    return user.__(getRandomItem(user, 'schedule.canceled'));
};

module.exports.schedule = schedule;

const favouriteLocation = {};

favouriteLocation.newLocation = (user) => {
    return user.__('favouriteLocation.newLocation');
};

favouriteLocation.editLocation = (user, location) => {
    return user.__('favouriteLocation.editLocation', { title: location.title });
};

favouriteLocation.canceled = (user) => {
    return user.__(getRandomItem(user, 'favouriteLocation.canceled'));
};

favouriteLocation.newName = (user, location) => {
    return user.__('favouriteLocation.newName', { title: location.title });
};

favouriteLocation.editName = (user, location) => {
    return user.__('favouriteLocation.editName', { name: nlg.appendArticle(user, location.name) });
};

favouriteLocation.nameHint = (user) => {
    return user.__('favouriteLocation.nameHint');
};

favouriteLocation.maxLocationReached = (user, maxLocation) => {
    return user.__('favouriteLocation.maxLocationReached', { maxLocation });
};

favouriteLocation.missingName = (user) => {
    return user.__('favouriteLocation.missingName');
};

favouriteLocation.approveNewLocation = (user, location, name) => {
    return user.__('favouriteLocation.approveNewLocation', { title: location.title, name });
};

favouriteLocation.newLocationAdded = (user, name) => {
    return user.__(getRandomItem(user, 'favouriteLocation.newLocationAdded'), { name });
};

favouriteLocation.addNewLocation = (user) => {
    return user.__('favouriteLocation.addNewLocation');
};

favouriteLocation.confirmRemoval = (user, location) => {
    return user.__('favouriteLocation.confirmRemoval', { name: nlg.appendArticle(user, location.name) });
};

favouriteLocation.locationRemoved = (user, location) => {
    const name = nlg.capitalize(nlg.appendArticle(user, location.name));
    return user.__(getRandomItem(user, 'favouriteLocation.locationRemoved'), { name });
};

favouriteLocation.cancelRemoval = (user) => {
    return user.__(getRandomItem(user, 'favouriteLocation.cancelRemoval'));
};

favouriteLocation.noFavourites = (user) => {
    return user.__('favouriteLocation.noFavourites');
};

favouriteLocation.addFirst = (user) => {
    return user.__('favouriteLocation.addFirst');
};

favouriteLocation.firstLocationAdded = (user) => {
    return user.__('favouriteLocation.firstLocationAdded');
};

favouriteLocation.addHint = (user) => {
    return user.__('favouriteLocation.addHint');
};

module.exports.favouriteLocation = favouriteLocation;


const feedback = {};

feedback.intro = (user) => {
    return user.__('feedback.intro');
};

feedback.listening = (user) => {
    return user.__(getRandomItem(user, 'feedback.listening'));
};

feedback.addTextFirst = (user) => {
    return user.__('feedback.addTextFirst');
};

feedback.attachImage = (user) => {
    return user.__('feedback.attachImage');
};

feedback.skipImageUpload = (user) => {
    return user.__('feedback.skipImageUpload', { sendFeedback: user.__('button.sendFeedback') });
};

feedback.canceled = (user) => {
    return user.__(getRandomItem(user, 'feedback.canceled'));
};

feedback.thanksForFeedback = (user) => {
    return user.__('feedback.thanksForFeedback');
};

module.exports.feedback = feedback;


const dataCollection = {};

dataCollection.greeting = (user) => {
    return user.__('dataCollection.greeting', { name: user.firstName });
};

dataCollection.thanksForTheClick = (user) => {
    return user.__('dataCollection.thanksForTheClick');
};

dataCollection.testMe = (user) => {
    return user.__('dataCollection.testMe');
};

dataCollection.writeSentences = (user) => {
    return user.__('dataCollection.writeSentences');
};

dataCollection.willBeHelpful = (user) => {
    return user.__('dataCollection.willBeHelpful');
};

dataCollection.getStarted = (user) => {
    return user.__('dataCollection.getStarted');
};

module.exports.dataCollection = dataCollection;

/**
 * Véletlenszerűen visszaad egyet az alternatív szövegek közül
 * @param {object} user a felhasználót reprezentáló objektum
 * @param {string} path az alternatív szövegek listájához vezető i18n útvonal
 */
const getRandomItem = (user, path) => {
    const idx = getRandomIndex(user, path);
    return `${path}.${idx}`;
};

/**
 * Véletlenszerűen visszaadja az alternatív szövegek közül egyik indexét
 * @param {object} user a felhasználót reprezentáló objektum
 * @param {string} path az alternatív szövegek listájához vezető i18n útvonal
 */
const getRandomIndex = (user, path) => {
    const length = Object.keys(user.__(path)).length;
    return Math.floor(Math.random() * length);
};