'use strict';
const fetch = require('node-fetch');

module.exports = function getUserProfile(userId) {
  const url = `https://graph.facebook.com/v2.6/${userId}?fields=first_name,last_name,profile_pic&access_token=${this.accessToken}`;
  return fetch(url)
    .then(res => res.json())
    .catch(err => console.log(`Error getting user profile: ${err}`));
}