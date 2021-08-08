'use strict';

const { confirmAction } = require('../../../util/UtilManager').discord;
const BaseCommand = require('../BaseCommand');

class ReactionRolesCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'reactionroles',
      aliases: ['reactions', 'rr'],
      description: 'Allows server admins to create a reaction based role manager',
      usage: ['', 'add <@role> [@role @role etc..]', 'remove', 'create', '[list]'],
      permissions: 'MANAGE_ROLES',
    };
    super(socket, info);
  }

  async run(message, args) {
    const socket = this.socket;
    const commandPrefix = socket.cache.prefixes.get(String(message.guild.id)).prefix;
    const routines = ['add', 'remove', 'create', 'update', 'list'];

    const [methodRaw, roleRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'list';

    if (!routines.includes(method)) {
      message.channel.send(`${message.member}, Specify a valid subroutine`);
      return;
    }

    let roles = [];

    //  A list of key value pairs with channels and available roles
    let guild = socket.cache.reactionRoles.get(String(message.guild.id));

    // Check for actual role
    if (roleRaw && roleRaw.startsWith('<@&') && roleRaw.endsWith('>')) {
      roles[0] = message.guild.roles.cache.get(roleRaw.slice(3, -1));
    }

    // Check for extra roles and specifying makeme or makemenot only
    if (extraArgs) {
      extraArgs.forEach(elem => {
        if (elem.startsWith('<@&') && elem.endsWith('>')) {
          roles.push(message.guild.roles.cache.get(elem.slice(3, -1)));
        }
      });
    }

    // Limit roles to be below bots highest role
    let botHighest = message.guild.me.roles.highest;
    roles = roles.filter(role => role.comparePositionTo(botHighest) < 0 && !role.managed);

    let roleNames = [];
    roles.forEach(role => roleNames.push(role.name.toLowerCase()));
    let roleSnowflakes = [];
    roles.forEach(role => roleSnowflakes.push(role.id));

    // Store the existing emojis
    let emojis = Object.keys(guild.roles);
    let emote;
    let create = false;
    let update = false;
    let bot = await socket.driver.user;
    let printableEmote;
    let chan;
    let oldMsg;

    switch (method) {
      case 'add':
        // Catch if no roles are being added
        if (roles.length < 1) {
          message.channel.send(
            `${message.member}, Please provide at least one valid role to add. *The bot must have a higher role than all roles it is assigning!*`,
          );
          return;
        } else if (emojis.length > 19) {
          message.channel.send(`${message.member}, There are already 20 sets of reactions roles in this server, plese remove one first.`);
          return;
        }
        emote = await getEmote(socket, message, roles);
        if (!emote) {
          return;
        }

        printableEmote = Number(emote) ? await socket.driver.emojis.cache.get(emote) : emote;
        if (emojis.indexOf(String(emote)) > -1) {
          message.reply(`${printableEmote} is already in use, please try again and specify a new emote!`);
          return;
        } else {
          guild.roles[String(emote)] = roleSnowflakes;
        }
        break;
      case 'remove':
        // There must be a reaction first
        if (emojis.length < 1) {
          message.channel.send(`${message.member}, There are no reaction roles yet!`);
          return;
        }

        emote = await getEmote(socket, message, roles, emojis, false);
        if (!emote) {
          return;
        }
        printableEmote = Number(emote) ? await socket.driver.emojis.cache.get(emote) : emote;
        if (emojis.indexOf(String(emote)) < 0) {
          message.reply(`${printableEmote} is not currently being used for reaction roles!`);
          return;
        } else {
          let deleted = false;
          delete guild.roles[String(emote)];
          if (Object.keys(guild.roles).length < 1) {
            let reactionsMsg = await socket.driver.channels.cache
              .get(guild.channelID)
              .messages.fetch(guild.messageID)
              .catch(() => undefined);
            if (reactionsMsg && reactionsMsg.author.id === bot.id) {
              reactionsMsg.delete();
              guild.channelID = '';
              guild.messageID = '';
              deleted = true;
            }
          }
          await socket.app.database.tables.reactionRoles.edit(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
          message.reply(
            `Deleted ${printableEmote} and associated roles from reaction roles.` +
              `${deleted ? 'There are no more reactions roles left, the reaction message has been deleted.' : ''}`,
          );
          return;
        }
      case 'create':
        // Check for appropriate permissions
        if (!message.channel.permissionsFor(bot).has(['ADD_REACTIONS', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS', 'READ_MESSAGE_HISTORY'])) {
          message.channel
            .send(
              `${message.member}, Unable to generate reaction roles here. ` +
                `Please make sure that I have permission to \`Add Reactions\` and \`Use External Emoji\``,
            )
            .then(msg => msg.delayDelete(5000));
          message.delete();
          return;
        }
        if (emojis.length < 1) {
          message.channel.send(`${message.member}, There are no reaction roles yet!`).then(msg => msg.delayDelete(5000));
          message.delete();
          return;
        }

        if (guild.messageID) {
          const confirm = await confirmAction(
            message,
            'The reaction role message already exists in this server, performing this action will erase it. Are you sure? ✅ (yes) or ❌(cancel)',
            60000,
          ).catch(() => undefined);
          if (!confirm) {
            if (message.deletable) {
              message.delete();
            }
            return;
          } else {
            oldMsg = await socket.driver.channels.cache
              .get(guild.channelID)
              .messages.fetch(guild.messageID)
              .catch(() => undefined);
            if (oldMsg?.deletable) oldMsg.delete();
          }
        }
        create = true;
        break;
      case 'update':
        // Check that there is an existing message
        if (!guild.messageID) {
          message.channel.send(`${message.member}, There is no reaction role message yet, unable to update it!`).then(msg => msg.delayDelete(5000));
          message.delete();
          return;
        }

        // Check to make sure the message still exists
        oldMsg = await socket.driver.channels.cache
          .get(guild.channelID)
          .messages.fetch(guild.messageID)
          .catch(() => undefined);
        if (!oldMsg) {
          message.channel.send(`${message.member}, The reaction role message has been deleted, unable to update it!`).then(msg => msg.delayDelete(5000));
          guild.messageID = '';
          guild.channelID = '';
          socket.app.database.tables.reactionRoles.edit(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
          message.delete();
          return;
        }

        // Check for appropriate permissions
        chan = await socket.driver.channels.cache.get(guild.channelID);
        if (!chan.permissionsFor(bot).has(['ADD_REACTIONS', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS', 'READ_MESSAGE_HISTORY'])) {
          message.channel
            .send(
              `${message.member}, Unable to update reaction roles message, ` +
                `Please make sure that I have permission to \`Add Reactions\` and \`Use External Emoji\``,
            )
            .then(msg => msg.delayDelete(5000));
          message.delete();
          return;
        }

        // If there are no longer any roles, delete the message after prompting
        if (emojis.length < 1) {
          const confirm = await confirmAction(
            message,
            'There are no longer any reaction roles assigned, performing this action will erase the message. Are you sure? ✅ (yes) or ❌(cancel)',
            60000,
          ).catch(() => undefined);
          if (!confirm) {
            if (message.deletable) message.delete();
          } else {
            if (message.deletable) message.delete();
            if (oldMsg?.deletable) oldMsg.delete();
          }
          return;
        }
        create = true;
        update = oldMsg;
        break;
      case 'list':
    }

    await socket.app.database.tables.reactionRoles.edit(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);

    emojis = Object.keys(guild.roles);
    // Create base embed
    let msg = socket.getEmbed('reactionRoles', [message.member, commandPrefix]);
    if (create) {
      msg.setDescription('React to this message with one of the emotes specified below to recieve all the roles listed below it');
      msg.setFooter('');
    }
    if (emojis.length < 1) {
      message.channel.send({ content: '**No reactions specified yet**', embeds: [msg] });
      return;
    }
    // Variables for counting to limt
    let fields = 0;
    // Variables to store looped information
    let roleObj;
    let outRoles = [];
    // Loop through each emoji found
    for (const emoteID of emojis) {
      /* eslint-disable-next-line no-await-in-loop */
      printableEmote = Number(emoteID) ? await socket.driver.emojis.cache.get(emoteID) : emoteID;

      // Get role objects so discord can embed properly
      guild.roles[emoteID].forEach(id => {
        roleObj = message.guild.roles.cache.get(id);
        outRoles.push(roleObj);
      });

      // Create and send embeds
      if (outRoles.length > 40) {
        for (let i = 1; i <= Math.ceil(outRoles.length / 40); i++) {
          if (fields < 24) {
            msg.addField(printableEmote, outRoles.slice((i - 1) * 40, i * 40).join('\n'), true);
            fields += 1;
          } else {
            fields = 0;
            message.channel.send({ embeds: [msg] });
            msg = socket.getEmbed('reationRoles', [message.member, commandPrefix]);
            if (create) {
              msg.setDescription('');
              msg.setTitle('');
              msg.setFooter('');
            }
          }
        }
      } else if (outRoles.length > 0) {
        msg.addField(printableEmote, outRoles.join('\n'), true);
        fields += 1;
      }
      // Clear arrays
      outRoles = [];
    }
    let reactionMsg;
    if (!update) {
      // Send the message
      reactionMsg = await message.channel.send({ embeds: [msg] });
    } else if (update.author === bot) {
      // If the message was sent by the bot, update the embed, otherwise just use the authors message.
      reactionMsg = await update.edit({ embeds: [msg] });
    } else {
      reactionMsg = update;
    }

    if (update) {
      // Remove reactions that are no longer used.
      reactionMsg.reactions.cache.forEach(reaction => {
        // Find the emote id or name depending on if the emote is custom or not
        let parsedEmote;
        if (!reaction.emoji.id) {
          parsedEmote = reaction.emoji.name;
        } else {
          parsedEmote = reaction.emoji.id;
        }
        if (emojis.indexOf(String(parsedEmote)) < 0) {
          reaction.remove();
        }
      });
    }
    if (create) {
      // Add reactions to the message
      for (const emoteID of emojis) {
        reactionMsg.react(emoteID);
      }
      guild.messageID = String(reactionMsg.id);
      guild.channelID = String(reactionMsg.channel.id);
      socket.app.database.tables.reactionRoles.edit(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
      message.delete();
    }
  }
}

async function getEmote(sock, initiator, roleList, emojis = false, add = true) {
  let emoteMsg;
  let embed = await sock.getEmbed('reactionRoles', [initiator.member]);
  if (add) {
    let fieldNum = 0;
    embed.setDescription('React to this message with the emote you would like to assign the roles to.');
    if (roleList.length > 40) {
      for (let i = 1; i <= Math.ceil(roleList.length / 40); i++) {
        if (fieldNum < 24) {
          embed.addField('Roles', roleList.slice((i - 1) * 40, i * 40).join('\n'), true);
          embed.setFooter('');
          fieldNum += 1;
        } else {
          fieldNum = 0;
          initiator.channel.send({ embeds: [embed] });
          embed = sock.getEmbed('reactionRoles', [initiator.member]);
          embed.setDescription('');
          embed.setTitle('');
        }
      }
    } else {
      embed.addField('Roles', roleList.join('\n'), true);
    }
    emoteMsg = await initiator.channel.send({ embeds: [embed] });
  } else {
    embed.setDescription('React to this message with the emote you would like to remove from reactions.');
    let printableEmojis = [];
    for (const emoteID of emojis) {
      /* eslint-disable-next-line no-await-in-loop */
      const printableEmote = Number(emoteID) ? await sock.driver.emojis.cache.get(emoteID) : emoteID;
      printableEmojis.push(printableEmote);
    }
    embed.addField('Current Reactions', printableEmojis.join(' '));
    emoteMsg = await initiator.channel.send({ embeds: [embed] });
    for (const emoteID of emojis) {
      emoteMsg.react(emoteID);
    }
  }
  let collect = true;
  // Wait for reaction from the original message sender
  let collected = await emoteMsg
    .awaitReactions((reaction, user) => user.id === initiator.author.id, { max: 1, time: 60000, errors: ['time'] })
    .catch(() => {
      initiator.channel.send(`${initiator.member}, Error getting emote`);
      collect = false;
    });
  if (!collect) {
    return false;
  }

  // Find the emote id or name depending on if the emote is custom or not
  let reaction = collected.first();
  let emoji = reaction.emoji;
  if (!emoji.id) {
    reaction = emoji.name;
  } else {
    reaction = emoji.id;
    if (!sock.driver.emojis.cache.has(reaction) || emoji.managed) {
      reaction = false;
    }
  }

  // Recursively get emote if not available
  if (reaction) {
    emoteMsg.delete();
    return reaction;
  } else {
    emoteMsg.delete();
    let errorMsg = await initiator.channel.send('I do not have access to that emote at this time, please try again!');
    errorMsg.delayDelete(5000);
    return getEmote(sock, initiator, roleList, emojis, add);
  }
}

module.exports = ReactionRolesCommand;
