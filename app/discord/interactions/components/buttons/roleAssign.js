'use strict';

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
    const [, expectedNum, rawRoles] = interaction.customID.split(':');
    const roles = rawRoles?.split('-');
    if (Number(expectedNum) !== roles?.length) {
      interaction.reply('An error occured, please try again!', { ephemeral: true });
      return;
    }
    interaction.defer({ ephemeral: true });
    let method = 'add';
    if (roles.every(roleID => interaction.member.roles.cache.has(roleID))) {
      method = 'remove';
    }
    const changed = await interaction.member.roles[method](roles).catch(err => this.socket.app.log.warn(module, '[Button Roles]', err));
    if (!changed) {
      interaction.reply(`There was an error ${method}ing ${expectedNum > 1 ? 'those roles' : 'that role'}.`);
      return;
    }
    interaction.reply(`You ${method === 'add' ? 'now' : 'no longer'} have ${roles.map(role => `<@&${role}>`).join(', ')}`);
  }

  /**
   * A definition of a button that assings roles
   * @typedef {Object} RoleButtonData
   * @prop {number} color the color / style of the button
   * @prop {Snowflake[]} roles the roles the button assigns, up to 3
   * @prop {string} [name] the label for the button, one of name or emoji is required
   * @prop {RawEmoji} [emoji] the emoji for the button, one of name or emoji is required
   * @prop {boolean} [disabled] whether the button is disabled
   */

  /**
   * Generates a definition for the message componenets field
   * @param {Collection<Snowflake, RoleButtonData>} buttons the buttons to send
   * @returns {Object[]}
   */
  generateDefinition(buttons) {
    const formatted = buttons.map(button => this.generateButton(button));
    const output = [];
    for (let i = 1; i <= 5 && i <= Math.ceil(buttons.length / 5); i++) {
      output.push({ type: 1, components: [] });
    }
    formatted.forEach((button, index) => {
      output[Math.ceil((index + 1) / 5) - 1].components.push(button);
    });
    return output;
  }

  /**
   * Generates a discord ready button with a custom id
   * @param {RoleButtonData} button the button to generate
   * @returns {Object}
   * @private
   */
  generateButton(button) {
    const custom_id = `${ComponentFunctions[this.name]}:${button.roles.length}:${button.roles.join('-')}`;
    const formatted = {
      type: 2,
      style: button.color,
      label: button.name,
      custom_id,
      emoji: button.emoji,
      disabled: button.disabled,
    };
    return formatted;
  }
}

module.exports = RoleAssignComponent;
