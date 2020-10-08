'use strict';

const helpers = require.main.require('./app/util/helpers');

module.exports = (socket, member) => {
  const created = helpers.humanDate(member.user.createdAt);
  let embed = socket.getEmbed('memberAdd', [
    member.user.displayAvatarURL(),
    member, member.user.tag, created,
    member.user.id,
  ]);
  if (socket.isGuild(member.guild.id, 'platicorn')) {
    member.roles.add("581396312914919424");
    socket.sendWebhook('userJoin', embed,);
  }
  else if (member.guild.id === "756319910191300778") {
    socket.sendMessage('helpLogs', embed,);
  }
  else if (member.guild.id === "140230462940381184") {
    setTimeout(function() { member.roles.add("140254897479090176")}, 300000);
  }
};
