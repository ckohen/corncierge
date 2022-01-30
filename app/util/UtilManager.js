'use strict';

const { Collection } = require('discord.js');
const humanize = require('humanize-duration');
const moment = require('moment');

/**
 * Stores various general purpose utilities for the application
 */
class UtilManager {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  /**
   * An object containing all the constant data
   * @type {Object}
   * @readonly
   * @private
   */
  static get constants() {
    return require('./Constants');
  }

  /**
   * An object containing all discord utilities
   * @type {DiscordUtil}
   * @readonly
   */
  static get discord() {
    return require('./DiscordUtil');
  }

  /**
   * An object containing all http utilities
   * @type {HTTPUtil}
   * @readonly
   */
  static get http() {
    return require('./HTTPUtil');
  }

  /**
   * An object containing all twich utilities
   * @type {TwitchUtil}
   * @readonly
   */
  static get twitch() {
    return require('./TwitchUtil');
  }

  /**
   * Restricts a numeric value to be between to numbers
   * @param {number} value the number to clamp
   * @param {number} min the minimum desired value
   * @param {number} max the maximum desired value
   * @returns {number}
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Organizes an array of items into a discord collection based on a key
   * @param {Collection} map the collection to arrange the data in
   * @param {Object[]} items the data to rearrange
   * @param {string} key the element key to use as the identifier in the collection
   * @param {string} [val] only store a specific value (secondaryKey must be set (can be false) to use this)
   */
  static collect(map, items, key, val = null) {
    if (!(map instanceof Collection)) return;
    if (Array.isArray(items) && items.length === 0) return;

    items.forEach(element => {
      if (typeof element[key] === 'undefined' || element[key] === null) return;
      map.set(element[key], val ? element[val] ?? element : element);
    });
  }

  /**
   * Replaces parameters wrapped in {} with values
   * @param {string} template the message to format with additional information
   * @param {Map} values an object containing key value pairs of what to replace and what it is replaced with
   * @returns {string}
   */
  static format(template, values = {}) {
    if (!template) return false;
    if (!values || values.size === 0) return template;
    return template.replace(/{([^{}]*)}/g, (match, key) => {
      if (!values.has(key)) return match;
      return values.get(key);
    });
  }

  /**
   * Makes a number of bytes easier to read for humans
   * @param {number} bytes the raw number of bytes
   * @returns {string}
   */
  static humanBytes(bytes) {
    if (!bytes) return false;
    const unit = 1024;
    if (bytes > unit ** 3) return `${Math.round((100 * bytes) / unit ** 3) / 100} GiB`;
    if (bytes > unit ** 2) return `${Math.round((100 * bytes) / unit ** 2) / 100} MiB`;
    if (bytes > unit) return `${Math.round((100 * bytes) / unit) / 100} KiB`;
    return `${Math.round(bytes)} B`;
  }

  /**
   * Formats a date to the form `Month #, ####`
   * @param {Date} time the date to transform
   * @returns {string}
   */
  static humanDate(time) {
    return moment(time).format('MMM D, YYYY');
  }

  /**
   * Formats a time in milliseconds to a human readable form
   * @param {number} diff the time to reformat
   * @returns {string}
   */
  static humanDuration(diff) {
    return humanize(diff, {
      round: true,
      units: ['y', 'mo', 'd', 'h', 'm', 's'],
    });
  }

  /**
   * Generates a random value between the specified values
   * @param {number} min the minimum end of the allowed range
   * @param {number} max the maximum end of the allowed range
   * @returns {number}
   */
  static jitter(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Formats a twitch message to start with a mention if set
   * @param {boolean} mention whether or not to mention the target
   * @param {string} target the person to send the message to
   * @param {string} message the message to augment
   * @returns {string}
   */
  static mentionable(mention, target, message) {
    return mention === true ? `@${target} ${message}` : message;
  }

  /**
   * Sets default properties on an object that aren't already specified.
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   * @private
   */
  static mergeDefault(def, given) {
    if (!given) return def;
    for (const key in def) {
      if (!Object.prototype.hasOwnProperty.call(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = UtilManager.mergeDefault(def[key], given[key]);
      }
    }
    return given;
  }

  /**
   * Gets the relative amount of time since a specified time
   * @param {Moment|string|number|Date} then the time to get the difference from now as
   * @param {number} specificity the maximum units to display
   * @param {boolean} preferHours whether to use hours instead of days
   * @returns {string}
   */
  static relativeTime(then, specificity = 2, preferHours = false) {
    const twoDays = 172800000;
    const diff = moment().diff(then);
    const units = ['y', 'mo', 'd', 'h', 'm', 's'];
    if (preferHours && diff < twoDays) units.splice(2, 1);
    return humanize(diff, {
      units,
      conjunction: ' and ',
      largest: specificity,
      round: true,
      serialComma: false,
    });
  }

  /**
   * Formats an array of usages in a readable form
   * @param {string|string[]} value all of the available usage types
   * @param {string} prefix the prefix for the command
   * @param {string} command the command name
   * @returns {string}
   */
  static usage(value, prefix, command) {
    if (!value || value.length === 0) return `${prefix}${command}`;
    const lines = Array.isArray(value) ? value : [value];
    return lines.map(line => `${prefix}${command} ${line}`).join('\n');
  }

  /**
   * A function caller that repatedly calls after a pseudo random time
   * @param {Function} callback the function to call after each delay
   * @param {Function} delay the function that determines a delay time (returns number)
   * @param {Function} [wrapper] a function called that handles the restart and callback of the interval
   * @returns {self}
   */
  static variableInterval(callback, delay, wrapper) {
    /* eslint-disable-next-line consistent-this */
    const self = this;
    if (typeof callback !== 'function') {
      throw Error('Expected a callback function');
    }
    if (typeof delay !== 'function') {
      throw Error('Expected a delay function');
    }
    function clear() {
      clearTimeout(self.id);
      self.id = null;
    }
    function start() {
      const time = delay();
      if (typeof time === 'undefined' || time === null) return;
      self.id = setTimeout(self.wrapper, time);
    }
    self.wrapper =
      wrapper ||
      function w() {
        /* eslint-disable-next-line callback-return */
        callback();
        start();
      };
    start();
    self.clear = clear;
    return self;
  }
}

module.exports = UtilManager;
