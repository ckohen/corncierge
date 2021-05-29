'use strict';

const BaseAppCommand = require('./BaseAppCommand');
const { ComponentFunctions } = require('../../../util/Constants');
const { isSnowflake } = require('../../../util/DiscordUtil');

class ButtonRoleAppCommand extends BaseAppCommand {
  constructor(socket) {
    const info = {
      definition: getDefinition(),
      requiresBot: true,
      permissions: 'MANAGE_ROLES',
      guilds: '788600861982588940',
    };
    super(socket, info);
  }

  async run(interaction, args) {
    const method = args[0].name;
    args = args[0].options;

    const cacheID = `${interaction.guildID}-${interaction.member.id}`;
    let data = this.socket.cache.buttonRoles.get(cacheID);
    if (!data) {
      this.socket.cache.buttonRoles.set(cacheID, { messageID: null, embed: { title: null, description: null }, buttons: null });
      data = this.socket.cache.buttonRoles.get(cacheID);
    }

    interaction.defer({ ephemeral: true });

    let finalizedDisplay = false;

    switch (method) {
      case 'edit': {
        const messageID = getArg(args, 'messageid');
        if (!isSnowflake(messageID)) {
          interaction.reply('The message id provided was not a valid message id');
          return;
        }
        const message = await interaction.channel.messages.fetch(messageID).catch(err => this.socket.app.log.debug(module, err));
        if (!message) {
          interaction.reply('That message does not seem to be in this channel, or it was deleted.');
          return;
        }
        if (message.author.id !== interaction.client.user.id || !message.components?.length) {
          interaction.reply('The message id provided was for a message that is not a button role message!');
          return;
        }
        if (message.embeds?.[0]) {
          data.embed.title = message.embeds[0].title;
          data.embed.description = message.embeds[0].description;
        }
        data.messageID = messageID;
        const buttons = formatFetchedButtons(message.components);
        if (!buttons) {
          interaction.reply('The message id provided was for a message that is not a button role message!');
          return;
        }
        data.buttons = buttons;
      }
      // eslint-disable-next-line no-fallthrough
      case 'new': {
        const title = getArg(args, 'title');
        const description = getArg(args, 'description');
        if (method === 'new') {
          data.messageID = null;
          data.embed = { title: null, description: null };
          data.buttons = [];
        }
        if (title) data.embed.title = title;
        if (description) data.embed.description = description;
        break;
      }
      case 'buttons': {
        if (!data.buttons) {
          interaction.reply('Please initiate a new button role message or edit an existing one before modifying buttons!');
          return;
        }
        const submethod = args[0].name;
        args = args[0].options;
        let buttonID = data.buttons.length;
        switch (submethod) {
          case 'edit': {
            buttonID = getArg(args, 'buttonid') - 1;
            if (!data.buttons[buttonID]) {
              interaction.reply('That button does not exist yet, try creating it!');
              return;
            }
            const disabled = getArg(args, 'disable');
            if (disabled !== null) data.buttons[buttonID].disabled = disabled;
          }
          // eslint-disable-next-line no-fallthrough
          case 'add': {
            let botHighest = interaction.guild.me.roles.highest;
            let button = data.buttons[buttonID];
            if (!button) {
              button = {
                color: getArg(args, 'color'),
                roles: [],
                name: getArg(args, 'label'),
                disabled: false,
              };
            }
            const role1 = getArg(args, 'role');
            const role2 = getArg(args, 'role2');
            const role3 = getArg(args, 'role3');
            if (role1) button.roles[0] = role1;
            if (role2) button.roles[1] = role2;
            if (role3) button.roles[2] = role3;
            const newRoles = [];
            button.roles.forEach(role => {
              if (role) newRoles.push(role);
            });
            let allBelow = true;
            newRoles.forEach(roleID => {
              const role = interaction.guild.roles.cache.get(roleID);
              if (role.comparePositionTo(botHighest) >= 0 || role.managed) allBelow = false;
            });
            if (!allBelow) {
              interaction.reply('Please only select roles below the bots highest role');
              return;
            }
            button.roles = newRoles;
            let emote = getArg(args, 'emoji');
            if (emote) {
              emote = parseEmote(emote);
              button.emoji = emote;
            }
            if (!button.name && !button.emoji) {
              button.name = interaction.guild.roles.cache.get(newRoles[0]).name;
            }
            data.buttons[buttonID] = button;
            break;
          }
          case 'remove':
            buttonID = getArg(args, 'buttonid') - 1;
            if (!data.buttons[buttonID]) {
              interaction.reply('The specified button does not exist');
              return;
            }
            data.buttons.splice(buttonID, 1);
        }
        break;
      }
      case 'preview':
      case 'save':
        if (!data.buttons) {
          interaction.reply('Please initiate a new button role message or edit an existing one!');
          return;
        }
        finalizedDisplay = true;
    }

    let message = {};
    let buttons = data.buttons;
    if (method === 'new') {
      message.content = 'Creating a new button role message!';
    }
    if (!finalizedDisplay) {
      buttons = buttons.map((button, index) => ({ ...button, disabled: true, name: `ID: ${index + 1} ${button.name}` }));
    }
    let title = data.embed.title;
    if (data.embed.title || data.embed.description) {
      message.embed = { title, description: data.embed.description };
    }
    message.components = this.socket.interactions.buttonComponents.get('ROLE_ASSIGN').definition(buttons);
    let sent;
    if (method === 'save') {
      let path = interaction.client.api.channels(interaction.channel.id).messages;
      if (data.messageID) {
        sent = await path(data.messageID).patch({ data: message });
      } else {
        if (!message.embed) {
          message.embed = { description: 'Hello there' };
        }
        sent = await path
          .post({ data: message })
          .then(msg => path(msg.id).patch({ data: { flags: 1 << 2 } }))
          .catch(err => this.socket.app.log.warn(module, '[Post Button Roles]', err));
      }
      if (!sent) {
        interaction.reply('There was an error sending the message, please try again.');
        return;
      }
      interaction.reply('Success!');
      this.socket.cache.buttonRoles.delete(cacheID);
    } else {
      message.embeds = message.embed ? [message.embed] : [];
      delete message.embed;
      sent = await interaction.client.api
        .webhooks(interaction.applicationID, interaction.token)
        .messages('@original')
        .patch({ data: message })
        .catch(err => this.socket.app.log.warn(module, '[Respond Button Roles]', err));
    }
  }
}

function getArg(args, argName) {
  let foundArg = args?.find(arg => arg.name.toLowerCase() === argName.toLowerCase());
  return foundArg?.value ?? null;
}

function parseEmote(emoteString) {
  let emote = {
    name: emoteString,
  };
  let potentialCustom = emoteString.split(':');
  if (potentialCustom.length >= 2) {
    emote.name = potentialCustom[1];
    emote.id = potentialCustom[2].split('>')[0];
  }
  return emote;
}

function formatFetchedButtons(components) {
  const buttons = [];
  components.forEach(component => {
    if (component.type !== 1) return;
    component.components.forEach(c => {
      if (c.type !== 2) return;
      if (!c.custom_id.startsWith(String(ComponentFunctions.ROLE_ASSIGN))) return;
      buttons.push({
        color: c.style,
        roles: c.custom_id.split(':')[2].split('-'),
        name: c.label,
        emoji: c.emoji,
        disabled: c.disabled,
      });
    });
  });
  return buttons;
}

module.exports = ButtonRoleAppCommand;

function getDefinition() {
  return {
    name: 'buttonroles',
    description: 'Set up button roles!',
    default_permission: true,
    options: [
      {
        type: 1,
        name: 'new',
        description: 'Create a new button role message. ERASES ANY IN PROGRESS CREATIONS / EDITS',
        options: [
          {
            type: 3,
            name: 'title',
            description: 'The title to display for this set of buttons',
          },
          {
            type: 3,
            name: 'description',
            description: 'A short description to show along with this set of buttons',
          },
        ],
      },
      {
        type: 1,
        name: 'edit',
        description: 'Edit an already existing button role message',
        options: [
          {
            type: 3,
            name: 'messageid',
            description: 'The id of the buton role message to edit, it must be in the current channel',
            required: true,
          },
          {
            type: 3,
            name: 'title',
            description: 'The title to display for this set of buttons',
          },
          {
            type: 3,
            name: 'description',
            description: 'A short description to show along with this set of buttons',
          },
        ],
      },
      {
        type: 2,
        name: 'buttons',
        description: 'Edit buttons on the currently selected button role message',
        options: [
          {
            type: 1,
            name: 'add',
            description: 'Add a role button',
            options: [
              {
                type: 4,
                name: 'color',
                description: 'The color of the button',
                required: true,
                choices: [
                  {
                    name: 'Blurple',
                    value: 1,
                  },
                  {
                    name: 'Grey',
                    value: 2,
                  },
                  {
                    name: 'Green',
                    value: 3,
                  },
                  {
                    name: 'Red',
                    value: 4,
                  },
                ],
              },
              {
                type: 8,
                name: 'role',
                description: 'The role that this button toggles',
                required: true,
              },
              {
                type: 3,
                name: 'label',
                description: 'The label to display on the button, defaults to the name of the first role',
              },
              {
                type: 3,
                name: 'emoji',
                description: 'An emoji to display next to the label',
              },
              {
                type: 8,
                name: 'role2',
                description: 'An additional role that this button toggles',
              },
              {
                type: 8,
                name: 'role3',
                description: 'A third role that this button toggles',
              },
            ],
          },
          {
            type: 1,
            name: 'remove',
            description: 'Remove a role button',
            options: [
              {
                type: 4,
                name: 'buttonid',
                description: 'The id of the button to remove displayed in the last message',
                required: true,
              },
            ],
          },
          {
            type: 1,
            name: 'edit',
            description: 'Edit a role button',
            options: [
              {
                type: 4,
                name: 'buttonid',
                description: 'The id of the button to remove displayed in the last message',
                required: true,
              },
              {
                type: 4,
                name: 'color',
                description: 'The color for the button',
                choices: [
                  {
                    name: 'Blurple',
                    value: 1,
                  },
                  {
                    name: 'Grey',
                    value: 2,
                  },
                  {
                    name: 'Green',
                    value: 3,
                  },
                  {
                    name: 'Red',
                    value: 4,
                  },
                ],
              },
              {
                type: 3,
                name: 'label',
                description: 'The label to display on the button, defaults to the name of the first role',
              },
              {
                type: 3,
                name: 'emoji',
                description: 'An emoji to display next to the label',
              },
              {
                type: 5,
                name: 'disable',
                description: 'Temporarily disable the button while keeping it visible',
              },
              {
                type: 8,
                name: 'role',
                description: 'The role that this button toggles',
              },
              {
                type: 8,
                name: 'role2',
                description: 'An additional role that this button toggles',
              },
              {
                type: 8,
                name: 'role3',
                description: 'A third role that this button toggles',
              },
            ],
          },
        ],
      },
      {
        type: 1,
        name: 'preview',
        description: 'Preview the final output that is displayed after saving',
      },
      {
        type: 1,
        name: 'save',
        description: 'Update or send the button roles',
      },
    ],
  };
}
