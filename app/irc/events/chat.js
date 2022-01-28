'use strict';

const { twitch } = require('../../util/UtilManager');
const handlers = require('../handlers');

module.exports = async (socket, channel, user, messageRaw, self) => {
  // Ignore self
  if (self) return;

  const name = channel.slice(1);
  const cachedId = socket.channelIds.get(name);
  let channelData;
  if (cachedId) {
    channelData = socket.twitch.driver.channels.cache.get(cachedId);
    if (!channelData) {
      channelData = await socket.twitch.drivers.channels.fetch(cachedId, { force: true });
    }
  } else {
    channelData = socket.twitch.driver.channels.cache.find(chan => chan.name === name);
    if (!channelData) {
      channelData = await socket.twitch.driver.channels.search(name, { resultCount: 1 });
    }
    if (channelData) {
      socket.channelIds.set(name, channelData.id);
    }
  }

  if (!channelData) {
    socket.app.log.warn(module, `Unable to find channel ${name} after recieving message`);
    return;
  }
  const message = messageRaw.trim();
  const isPrivileged = twitch.isPrivileged(user, channelData);

  // Check for moderation filters
  const filter = socket.cache.filters.find(item => new RegExp(item.input, 'gi').test(message));

  if (filter && !isPrivileged) {
    // Handle moderation
    const { action, duration } = handlers.moderation(socket, channel, user, message, filter);

    // Log moderation
    socket.logModeration(filter.id, action, user.username, user['user-id'], duration, message);

    return;
  }

  // Separate arguments from command
  const args = message.trim().split(/\s+/g);
  let input = args.shift().toLowerCase();

  // Check for existing commands
  let command = socket.cache.commands.get(input);

  // TODO Replace static assignment with 2 allowable searches per channel
  if (!command) {
    if (message.indexOf('bonk') > -1) {
      command = socket.cache.commands.get('!bonk');
    } else {
      return;
    }
  }

  new handlers.command(socket, channelData, user, command, args, isPrivileged).execute();
};
