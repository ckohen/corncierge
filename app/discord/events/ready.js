'use strict';

module.exports = socket => {
  socket.driver.user.setActivity({
    name: socket.app.settings.get('discord_activity') ?? '',
    type: socket.app.settings.get('discord_activity_type') || 'PLAYING',
  });
  socket.app.log.status(module, 'Connected to Discord');
};
