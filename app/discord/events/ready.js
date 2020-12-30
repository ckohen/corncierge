'use strict';

module.exports = socket => {
  socket.driver.user.setActivity(socket.app.settings.get('discord_activity') || null, { type: socket.app.settings.get('discord_activity_type') || 'PLAYING' });
  socket.app.log(module, 'Connected to Discord');
};
