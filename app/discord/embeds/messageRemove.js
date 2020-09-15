module.exports = (comp, message, Msg) => comp
      .setThumbnail(message.member.user.displayAvatarURL())
      .setColor('orange')
      .setTitle(message.member.user.tag)
      .addField("Message Deleted", Msg || "Unable to get message content.")
      .setDescription(`${message.member}'s message in ${message.channel} was deleted.`)
      .setTimestamp(Date.now());