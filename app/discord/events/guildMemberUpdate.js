'use strict';

module.exports = (socket, before, after) => {
  let embed = false;
  let method = false;

  let voiceRoles = socket.cache.voiceRoles.get(String(after.guild.id));

  let ignoredRoles = ['140254897479090176', '581396312914919424'];

  let voiceRole = after.guild.roles.cache.find(item => item.name.toLowerCase() === 'voice');

  if (voiceRoles && Object.keys(voiceRoles.data).length > 0) {
    let voiceRoleIDs = Object.keys(voiceRoles.data);
    ignoredRoles = ignoredRoles.concat(voiceRoleIDs);
  } else if (voiceRole) {
    ignoredRoles.push(voiceRole.id);
  }

  if (before.displayName !== after.displayName) {
    embed = socket.getEmbed('userChange', ['Nickname', after, before.displayName, after.displayName]);
    method = 'nickChange';
  }
  if (!before.roles.cache.equals(after.roles.cache)) {
    let roleChanged = '';
    let rolesChanged;
    let type;
    if (before.roles.cache.array().length > after.roles.cache.array().length) {
      // Role Removed
      rolesChanged = before.roles.cache.filter(role => testRole(role, after.roles.cache));
      rolesChanged = rolesChanged.filter(role => ignoreRoles(role));
      type = 'removed';
    } else {
      // Role added
      rolesChanged = after.roles.cache.filter(role => testRole(role, before.roles.cache));
      rolesChanged = rolesChanged.filter(role => ignoreRoles(role));
      type = 'added';
    }
    rolesChanged.forEach(role => {
      roleChanged += `${role}`;
    });
    if (!roleChanged) {
      return;
    }
    embed = socket.getEmbed('roleChange', [after, roleChanged, type]);
    method = 'roleUpdate';
  }

  /**
   * Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
   * @event EventLogger#discordMemberUpdate
   * @param {GuildMember} oldMember The member before the update
   * @param {GuildMember} newMember The member after the update
   * @param {MessageEmbed?} embed The automatically generated embed for this member update
   * @param {string} type the type of change that occurred (roleUpdate or nickChange)
   */
  socket.app.eventLogger.emit('discordMemberUpdate', before, after, embed, method);

  function testRole(role, findRoles) {
    if (findRoles.find(foundRole => foundRole.name === role.name)) {
      return false;
    } else {
      return true;
    }
  }

  function ignoreRoles(role) {
    if (ignoredRoles.indexOf(role.id) < 0) {
      return true;
    } else {
      return false;
    }
  }
};
