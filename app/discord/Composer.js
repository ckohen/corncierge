'use strict';

const { MessageEmbed } = require('discord.js');

/**
 * Composer for rich Discord embeds.
 * @extends {MessageEmbed}
 * @private
 */
class Composer extends MessageEmbed {
  /**
   * Create a new composer instance.
   * @param {Object} options the options for the application that instantiated this
   * @param {Object} [data] data to pass to discord.js MessageEmbed
   */
  constructor(options, data = {}) {
    super(data);
    this.options = options;
  }

  /**
   * Set the color for the embed.
   * @param {string} color one of the colors specified in client options
   * @returns {self}
   */
  setColor(color) {
    this.color = this.options.discord.colors[color];
    return this;
  }
}

module.exports = Composer;
