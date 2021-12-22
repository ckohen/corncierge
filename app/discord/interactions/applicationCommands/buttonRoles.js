'use strict';

const { MessageActionRow, Constants } = require('discord.js');
const { ApplicationCommandOptionTypes, MessageButtonStyles } = Constants;
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
    const method = args.getSubcommandGroup(false) ?? args.getSubcommand();

    const cacheId = `${interaction.guildId}-${interaction.member.id}`;
    let data = this.socket.cache.buttonRoles.get(cacheId);
    if (!data) {
      this.socket.cache.buttonRoles.set(cacheId, { messageId: null, embed: { color: null, title: null, description: null }, buttons: null });
      data = this.socket.cache.buttonRoles.get(cacheId);
    }

    await interaction.deferReply({ ephemeral: true });

    let finalizedDisplay = false;

    switch (method) {
      case 'edit': {
        const messageId = args.getString('messageid');
        if (!isSnowflake(messageId)) {
          interaction.editReply('The message id provided was not a valid message id');
          return;
        }
        const message = await interaction.channel?.messages.fetch(messageId).catch(err => this.socket.app.log.debug(module, err));
        if (!message) {
          interaction.editReply('That message does not seem to be in this channel, or it was deleted.');
          return;
        }
        if (message.author.id !== interaction.client.user.id || !message.components?.length) {
          interaction.editReply('The message id provided was for a message that is not a button role message!');
          return;
        }
        if (message.embeds?.[0]) {
          data.embed.title = message.embeds[0].title;
          data.embed.description = message.embeds[0].description;
          data.embed.color = message.embeds[0].color;
        }
        data.messageId = messageId;
        const buttons = formatFetchedButtons(message.components);
        if (!buttons) {
          interaction.editReply('The message id provided was for a message that is not a button role message!');
          return;
        }
        data.buttons = buttons;
        setEmbed(args, data);
        break;
      }
      case 'embed': {
        if (!data.buttons) {
          interaction.editReply('Please initiate a new button role message or edit an existing one before modifying the embed!');
          return;
        }
        const submethod = args.getSubcommand();
        switch (submethod) {
          case 'edit':
            setEmbed(args, data);
            break;
          case 'remove':
            data.embed = { color: null, title: null, description: null };
            break;
        }
        break;
      }
      case 'new':
        data.messageId = null;
        data.embed = { color: null, title: null, description: null };
        data.buttons = [];
        setEmbed(args, data);
        break;
      case 'buttons': {
        if (!data.buttons) {
          interaction.editReply('Please initiate a new button role message or edit an existing one before modifying buttons!');
          return;
        }
        const submethod = args.getSubcommand();
        let buttonId = data.buttons.length;
        switch (submethod) {
          case 'edit': {
            buttonId = args.getInteger('buttonid', true) - 1;
            if (data.buttons.length < buttonId) {
              interaction.editReply('That button does not exist yet, try creating it!');
              return;
            }
            if (!data.buttons[buttonId]) {
              interaction.editReply('You cannot edit blank buttons!');
              return;
            }
            const disabled = args.getBoolean('disable');
            if (disabled !== null) data.buttons[buttonId].disabled = disabled;
            const color = args.getInteger('color');
            const label = args.getString('label');
            if (color) data.buttons[buttonId].color = color;
            if (label) data.buttons[buttonId].name = label;
          }
          // eslint-disable-next-line no-fallthrough
          case 'add': {
            const newLine = args.getBoolean('newline');
            if (newLine) {
              if (buttonId > 20) {
                interaction.editReply('Unable to add a new row of buttons here (There are already 5 rows!)');
                return;
              }
              const newButtonId = Math.ceil(buttonId / 5) * 5;
              data.buttons.push(...Array(newButtonId - buttonId).fill(undefined));
              buttonId = newButtonId;
            }
            if (buttonId >= 25) {
              interaction.editReply('You can only have 25 buttons (including spacers)!');
              return;
            }
            let botHighest = interaction.guild.me.roles.highest;
            let button = data.buttons[buttonId];
            if (!button) {
              button = {
                color: args.getInteger('color', true),
                roles: [],
                name: args.getString('label'),
                disabled: false,
              };
            }
            const role1 = args.getRole('role', true);
            const role2 = args.getRole('role2');
            const role3 = args.getRole('role3');
            if (role1) button.roles[0] = role1.id;
            if (role2) button.roles[1] = role2.id;
            if (role3) button.roles[2] = role3.id;
            const newRoles = [];
            button.roles.forEach(role => {
              if (role) newRoles.push(role);
            });
            let allBelow = true;
            newRoles.forEach(roleId => {
              const role = interaction.guild.roles.cache.get(roleId);
              if (role.comparePositionTo(botHighest) >= 0 || role.managed) allBelow = false;
            });
            if (!allBelow) {
              interaction.editReply('Please only select roles below the bots highest role');
              return;
            }
            button.roles = newRoles;
            let emote = args.getString('emoji');
            if (emote) {
              emote = parseEmote(emote);
              button.emoji = emote;
            }
            if (!button.name && !button.emoji) {
              button.name = interaction.guild.roles.cache.get(newRoles[0]).name;
            }
            data.buttons[buttonId] = button;
            break;
          }
          case 'addspace':
            if (buttonId > 25) {
              interaction.editReply('You can only have 25 buttons (including spacers)!');
              return;
            }
            data.buttons[buttonId] = undefined;
            break;
          case 'swap': {
            const button1Id = args.getInteger('button1', true) - 1;
            const button2Id = args.getInteger('button2', true) - 1;
            if (data.buttons.length <= button1Id || data.buttons.length <= button2Id) {
              interaction.editReply('One of the specified buttons does not exist');
              return;
            }
            data.buttons[button1Id] = data.buttons.splice(button2Id, 1, data.buttons[button1Id])[0];
            break;
          }
          case 'remove':
            buttonId = args.getInteger('buttonid', true) - 1;
            if (data.buttons.length < buttonId) {
              interaction.editReply('The specified button does not exist');
              return;
            }
            data.buttons.splice(buttonId, 1);
        }
        break;
      }
      case 'preview':
      case 'save':
        if (!data.buttons) {
          interaction.editReply('Please initiate a new button role message or edit an existing one first!');
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
      buttons = buttons.map((button, index) => {
        if (button) {
          return { ...button, disabled: true, name: `ID: ${index + 1} ${button.name ?? ''}` };
        }
        return { color: 'SECONDARY', roles: [], disabled: true, name: `ID: ${index + 1} DISAPPEARS` };
      });
    }
    let title = data.embed.title;
    if (title || data.embed.description) {
      message.embeds = [{ title, description: data.embed.description, color: data.embed.color }];
    }
    message.components = this.socket.interactions.buttonComponents.get('ROLE_ASSIGN').definition(buttons);
    if (message.components.length === 0) {
      message.components = [
        new MessageActionRow({
          components: [
            {
              type: 'BUTTON',
              style: 'SECONDARY',
              customId: `${ComponentFunctions.ROLE_ASSIGN}:999:`,
              label: 'No button roles',
              emoji: {
                name: '😕',
              },
              disabled: true,
            },
          ],
        }),
      ];
    }
    let sent;
    if (method === 'save') {
      if (data.messageId) {
        message.flags = message.embeds ? 0 : 1 << 2;
        sent = await interaction.channel?.messages.edit(message).catch(() => false);
      } else {
        let suppress = false;
        if (!message.embeds) {
          message.embeds = [{ description: 'Hello there' }];
          suppress = true;
        }
        sent = await interaction.channel
          ?.send(message)
          .then(msg => msg.suppressEmbeds(suppress))
          .catch(err => this.socket.app.log.warn(module, '[Post Button Roles]', err));
      }
      if (!sent) {
        interaction.editReply('There was an error sending the message, please try again.');
        return;
      }
      interaction.editReply('Success!');
      this.socket.cache.buttonRoles.delete(cacheId);
    } else {
      message.embeds ??= [];
      await interaction.editReply(message).catch(err => this.socket.app.log.warn(module, '[Respond Button Roles]', err));
    }
  }
}

function setEmbed(args, data) {
  const title = args.getString('title');
  const description = args.getString('description');
  const color = args.getInteger('color');
  if (title) data.embed.title = title;
  if (description) data.embed.description = description;
  if (color) data.embed.color = color;
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
  components.forEach((component, index) => {
    if (component.type !== 'ACTION_ROW' && component.type !== 1) return;
    component.components.forEach(c => {
      if (c.type !== 'BUTTON' && c.type !== 2) return;
      const customId = c.customId ?? c.custom_id;
      if (!customId.startsWith(String(ComponentFunctions.ROLE_ASSIGN))) return;
      buttons.push({
        color: c.style,
        roles: customId.split(':')[2].split('-'),
        name: c.label,
        emoji: c.emoji,
        disabled: c.disabled,
      });
    });
    if (components[index + 1]) {
      const needs = 5 - (buttons.length % 5);
      if (needs) {
        buttons.push(...Array(needs).fill(undefined));
      }
    }
  });
  if (buttons.length === 0) return false;
  if (
    buttons.length === 1 &&
    (components[0].components[0].customId === `${ComponentFunctions.ROLE_ASSIGN}:999:` ||
      components[0].components[0].custom_id === `${ComponentFunctions.ROLE_ASSIGN}:999:`)
  ) {
    buttons.shift();
  }
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
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'new',
        description: 'Create a new button role message. ERASES ANY IN PROGRESS CREATIONS / EDITS',
        options: [
          {
            type: ApplicationCommandOptionTypes.STRING,
            name: 'title',
            description: 'The title to display for this set of buttons',
          },
          {
            type: ApplicationCommandOptionTypes.STRING,
            name: 'description',
            description: 'A short description to show along with this set of buttons',
          },
          {
            type: ApplicationCommandOptionTypes.INTEGER,
            name: 'color',
            description: 'A color for the embed, you can enter hex color codes here by prefixing it with 0x (e.g. 0xFF0000)',
          },
        ],
      },
      {
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'edit',
        description: 'Edit an already existing button role message',
        options: [
          {
            type: ApplicationCommandOptionTypes.STRING,
            name: 'messageid',
            description: 'The id of the buton role message to edit, it must be in the current channel',
            required: true,
          },
          {
            type: ApplicationCommandOptionTypes.STRING,
            name: 'title',
            description: 'The title to display for this set of buttons',
          },
          {
            type: ApplicationCommandOptionTypes.STRING,
            name: 'description',
            description: 'A short description to show along with this set of buttons',
          },
          {
            type: ApplicationCommandOptionTypes.INTEGER,
            name: 'color',
            description: 'A color for the embed, you can enter hex color codes here by prefixing it with 0x (e.g. 0xFF0000)',
          },
        ],
      },
      {
        type: 2,
        name: 'buttons',
        description: 'Edit buttons on the currently selected button role message',
        options: [
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'add',
            description: 'Add a role button',
            options: [
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'color',
                description: 'The color of the button',
                required: true,
                choices: [
                  {
                    name: 'Blurple',
                    value: MessageButtonStyles.PRIMARY,
                  },
                  {
                    name: 'Grey',
                    value: MessageButtonStyles.SECONDARY,
                  },
                  {
                    name: 'Green',
                    value: MessageButtonStyles.SUCCESS,
                  },
                  {
                    name: 'Red',
                    value: MessageButtonStyles.DANGER,
                  },
                ],
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role',
                description: 'The role that this button toggles',
                required: true,
              },
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'label',
                description: 'The label to display on the button, defaults to the name of the first role',
              },
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'emoji',
                description: 'An emoji to display next to the label',
              },
              {
                type: ApplicationCommandOptionTypes.BOOLEAN,
                name: 'newline',
                description: 'Whether to skip the rest of this row and place this button on the next line',
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role2',
                description: 'An additional role that this button toggles',
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role3',
                description: 'A third role that this button toggles',
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'remove',
            description: 'Remove a role button',
            options: [
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'buttonid',
                description: 'The id of the button to remove displayed in the last message',
                required: true,
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'edit',
            description: 'Edit a role button',
            options: [
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'buttonid',
                description: 'The id of the button to remove displayed in the last message',
                required: true,
              },
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'color',
                description: 'The color for the button',
                choices: [
                  {
                    name: 'Blurple',
                    value: MessageButtonStyles.PRIMARY,
                  },
                  {
                    name: 'Grey',
                    value: MessageButtonStyles.SECONDARY,
                  },
                  {
                    name: 'Green',
                    value: MessageButtonStyles.SUCCESS,
                  },
                  {
                    name: 'Red',
                    value: MessageButtonStyles.DANGER,
                  },
                ],
              },
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'label',
                description: 'The label to display on the button, defaults to the name of the first role',
              },
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'emoji',
                description: 'An emoji to display next to the label',
              },
              {
                type: ApplicationCommandOptionTypes.BOOLEAN,
                name: 'disable',
                description: 'Temporarily disable the button while keeping it visible',
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role',
                description: 'The role that this button toggles',
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role2',
                description: 'An additional role that this button toggles',
              },
              {
                type: ApplicationCommandOptionTypes.ROLE,
                name: 'role3',
                description: 'A third role that this button toggles',
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'swap',
            description: 'Swap the position of two buttons',
            options: [
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'button1',
                description: 'The id of the first button',
                required: true,
              },
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'button2',
                description: 'The id of the second button',
                required: true,
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'addspace',
            description: 'Add a button that will not appear in the final output, for end of row spacing purposes',
          },
        ],
      },
      {
        type: 2,
        name: 'embed',
        description: 'Control the embed on the currently selected button role message',
        options: [
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'edit',
            description: 'Edit the embed',
            options: [
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'title',
                description: 'The title to display for this set of buttons',
              },
              {
                type: ApplicationCommandOptionTypes.STRING,
                name: 'description',
                description: 'A short description to show along with this set of buttons',
              },
              {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: 'color',
                description: 'A color for the embed, you can enter hex color codes here by prefixing it with 0x (e.g. 0xFF0000)',
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: 'remove',
            description: 'Remove the embed',
          },
        ],
      },
      {
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'preview',
        description: 'Preview the final output that is displayed after saving',
      },
      {
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'save',
        description: 'Update or send the button roles',
      },
    ],
  };
}
