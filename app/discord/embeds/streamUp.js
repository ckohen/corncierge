'use strict';

module.exports = (comp, streamData) => comp
  .setTitle(streamData.status)
  .setColor('live')
  .setAuthor(`${streamData.display_name}`,"", comp.options.twitch.channel.url)
  .setURL(comp.options.twitch.channel.url)
  .setThumbnail(streamData.logo)
  .addField("Category", streamData.game || "No game", true)
  .addField("Followers", streamData.followers || "Unknown", true)
  .setImage(streamData.profile_banner)
  .setTimestamp(Date.now());