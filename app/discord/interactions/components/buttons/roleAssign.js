'use strict';

const { MessageButton, MessageActionRow } = require('discord.js');
const { ComponentFunctions } = require('../../../../util/Constants');
const BaseComponent = require('../BaseComponent');

class RoleAssignComponent extends BaseComponent {
  constructor(socket) {
    const info = {
      name: 'ROLE_ASSIGN',
      requiresBot: true,
    };
    super(socket, info);
    this.definition = this.generateDefinition.bind(this);
  }

  async run(interaction) {
    const [, expectedNum, rawRoles] = interaction.customId.split(':');
    const roles = rawRoles?.split('-');
    if (Number(expectedNum) !== roles?.length) {
      interaction.reply({ content: 'An error occured, please try again!', ephemeral: true });
      return;
    }
    await interaction.defer({ ephemeral: true });
    let method = 'add';
    if (roles.every(roleId => interaction.member.roles.cache.has(roleId))) {
      method = 'remove';
    }
    const changed = await interaction.member.roles[method](roles).catch(err => this.socket.app.log.warn(module, '[Button Roles]', err));
    if (!changed) {
      interaction.editReply(`There was an error ${method}ing ${expectedNum > 1 ? 'those roles' : 'that role'}.`);
      return;
    }
    interaction.editReply(`You ${method === 'add' ? 'now' : 'no longer'} have ${roles.map(role => `<@&${role}>`).join(', ')}`);
  }

  /**
   * A definition of a button that assings roles
   * @typedef {Object} RoleButtonData
   * @prop {number|string} color the color / style of the button
   * @prop {Snowflake[]} roles the roles the button assigns, up to 3
   * @prop {string} [name] the label for the button, one of name or emoji is required
   * @prop {RawEmoji} [emoji] the emoji for the button, one of name or emoji is required
   * @prop {boolean} [disabled] whether the button is disabled
   */

  /**
   * Generates a definition for the message componenets field
   * @param {Collection<Snowflake, RoleButtonData>} buttons the buttons to send
   * @returns {MessageComponentOptions[]}
   */
  generateDefinition(buttons) {
    const formatted = buttons.map((button, index) => this.generateButton(button, index));
    const output = [];
    for (let i = 1; i <= 5 && i <= Math.ceil(buttons.length / 5); i++) {
      output.push(new MessageActionRow());
    }
    formatted.forEach((button, index) => {
      if (button) {
        output[Math.ceil((index + 1) / 5) - 1].components.push(button);
      }
    });
    output.forEach((row, index) => {
      if (row.components.length === 0) {
        output.splice(index, 1);
      }
    });
    return output;
  }

  /**
   * Generates a discord ready button with a custom id
   * @param {RoleButtonData} button the button to generate
   * @param {number} index customIds must be unique so....
   * @returns {Object}
   * @private
   */
  generateButton(button, index) {
    if (button === undefined) return undefined;
    const customId = `${ComponentFunctions[this.name]}:${button.roles.length}:${button.roles.join('-')}:${index}`;
    const formatted = new MessageButton({
      style: button.color,
      label: button.name,
      customId,
      emoji: button.emoji,
      disabled: button.disabled,
    });
    return formatted;
  }
}

module.exports = RoleAssignComponent;
