'use strict';

const { MessageEmbed } = require('discord.js');
const BaseCommand = require('../BaseCommand');

class VariablesCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'variables',
      usage: ['(add|set) <name> <value>', '(delete|remove) <name>', '[list]'],
      description: 'set up custom variables for automatic replacement in irc commands',
      aliases: ['vars', 'twitchvars', 'twitchvariables', 'var', 'twitchvar', 'twitchvariable'],
      channel: 'commandManagement',
    };
    super(socket, info);
  }

  async run(message, args, source = 'discord') {
    if (source === 'discord' && this.socket.app.options.disableIRC) {
      message.channel.send('Twitch is not enabled for this bot (this command should be disabled)').catch(err => {
        this.socket.app.log.warn(module, err);
      });
      return;
    }
    const routines = ['add', 'edit', 'set', 'delete', 'remove', 'list'];

    const [actionRaw, nameRaw, ...valueRaw] = args;
    const action = actionRaw?.toLowerCase() ?? 'list';
    const name = nameRaw?.toLowerCase().trim().slice(0, 32) ?? null;
    valueRaw.forEach((chunk, index) => {
      if (chunk.startsWith('<') && chunk.endsWith('>')) {
        valueRaw[index] = chunk.split(':')[1];
      }
    });
    const value = valueRaw.length > 0 ? valueRaw.join(' ').trim() : null;

    const send = (content, mention = false) => {
      if (!content) return;
      const target = mention ? (source === 'discord' ? `, ${message.author}` : ', {user}') : '';
      switch (source) {
        case 'discord':
          message.channel.send(`${content}${target}.`).catch(err => {
            this.socket.app.log.warn(module, err);
          });
          break;
        case 'twitch':
          message.respond(`${content}${target}.`);
      }
    };

    const respond = content => send(content, true);

    if (!routines.includes(action)) {
      respond('Specify a valid subroutine');
      return;
    }
    if (action !== 'list' && !name) {
      respond('Provide a variable name');
      return;
    }

    const variables = this.socket.app.twitch?.irc?.cache?.variables?.get(this.socket.app.twitch?.options?.channel?.name);
    const variable = variables?.get(name);

    let data = null;
    let method = null;
    let failure = null;
    let success = null;
    let embed;
    let formatted = [];
    let stringFormatted = '';

    switch (action) {
      // Add variable
      case 'add':
        if (variable) {
          respond('That variable already exists');
          return;
        }
        if (variables?.size >= 25) {
          respond('There are already 25 variables for this channel, please delete some before adding more');
          return;
        }
        if (!value) {
          respond('Provide a value for the variable');
          return;
        }
        method = 'add';
        data = [name, this.socket.app.twitch?.options?.channel?.name ?? '', value];
        success = `Variable \`${name}\` added`;
        failure = "Couldn't add variable. Please try again";
        break;
      // Edit variable
      case 'edit':
      case 'set':
        if (!variable) {
          respond("That variable doesn't exist. Try adding it");
          return;
        }
        if (!value || value === variable.value) {
          respond('Provide an updated variable value');
          return;
        }
        method = 'edit';
        data = [variable.id, value];
        success = `Variable \`${name}\` updated`;
        failure = "Couldn't edit variable. Please try again";
        break;
      // Delete variable
      case 'delete':
      case 'remove':
        if (!variable) {
          respond("That variable doesn't exist");
          return;
        }
        method = 'delete';
        data = [variable.id];
        success = `Variable \`${name}\` deleted`;
        failure = "Couldn't delete variable. Please try again";
        break;
      // Edit command level
      case 'list':
        if (source !== 'discord') {
          respond('Unfortunately you cannot view the variable list here');
          return;
        }
        embed = new MessageEmbed().setTitle('Twitch Variables').setDescription('A list of all automatically replaceable variables');
        if (!variables || variables.size < 1) {
          embed.setColor('RED');
          embed.addField('Current variables', 'None yet! Add one!');
        } else {
          embed.setColor('BLURPLE');
          variables.forEach(vardata => formatted.push(`- \`{var-${vardata.name}}\` - ${vardata.value}`));
          formatted.forEach(row => {
            if (stringFormatted.length + row.length > 1000) {
              embed.addField('Current variables', stringFormatted);
              stringFormatted = '';
            }
            stringFormatted += `${row}\n`;
          });
          if (stringFormatted.length) {
            embed.addField('Current variables', stringFormatted);
          }
        }
        message.channel.send({ embeds: [embed] });
        return;
      default:
        return;
    }

    if (!method || !data) return;

    try {
      await this.socket.app.database.tables.ircVariables[method](...data);
    } catch (err) {
      this.socket.app.log.warn(module, err);
      respond(failure);
      return;
    }

    await this.socket.app.twitch?.irc?.cacheVariables();

    send(success);
  }
}

module.exports = VariablesCommand;
