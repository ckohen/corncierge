'use strict';

const BaseCommand = require('../BaseCommand');

class JumboCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'jumbo',
      description: 'jumbofies an emoji',
      permissions: 'MANAGE_EMOJIS',
    };
    super(socket, info);
  }

  run(message, args) {
    const requestRaw = args[0];

    if (new RegExp(/<(a)?:.+:.*>.*/, 'gi').test(requestRaw)) {
      let splitRequest = requestRaw.split(':');
      let animated = splitRequest[0] === '<a';
      let id = splitRequest[2].slice(0, -1);
      message.channel.send(`https://cdn.discordapp.com/emojis/${id}${animated ? '.gif' : '.png'}`);
      message.delete();
    } else {
      message.reply('Sorry, I cannot jumbo that!');
    }
  }
}

module.exports = JumboCommand;
