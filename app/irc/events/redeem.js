'use strict';

module.exports = (socket, channel, username, type, tags) => {
  console.log(`Reward on ${channel} from ${username}. Type: ${type} with tags ${tags}`);
};
