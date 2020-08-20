'use strict';

const moment = require('moment');
const { Collection } = require('discord.js');
const humanize = require('humanize-duration');

module.exports = {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  collect(map, items, key, secondaryKey, val = null) {
    if (!(map instanceof Collection)) return;
    if (Array.isArray(items) && items.length === 0) return;

    items.forEach((element) => {
      if (!element[key]) return;
      map.set(element[key] + (secondaryKey ? "-" + element[secondaryKey] : ""), val && element[val] ? element[val] : element);
    });
  },

  format(template, values = {}) {
    if (!template) return;
    if (!values || Object.keys(values).length === 0) return template;
    return template.replace(/{([^{}]*)}/g, (match, key) => {
      if (!Object.prototype.hasOwnProperty.call(values, key)) return match;
      return values[key];
    });
  },

  humanBytes(bytes) {
    if (!bytes) return;
    const unit = 1024;
    if (bytes > (unit ** 3)) return `${Math.round((100 * bytes) / (unit ** 3)) / 100} GiB`;
    if (bytes > (unit ** 2)) return `${Math.round((100 * bytes) / (unit ** 2)) / 100} MiB`;
    if (bytes > unit) return `${Math.round((100 * bytes) / unit) / 100} KiB`;
    return `${Math.round(bytes)} B`;
  },

  humanDate(time) {
    return moment(time).format('MMM D, YYYY');
  },

  humanDuration(diff) {
    return humanize(diff, {
      round: true, units: ['y', 'mo', 'd', 'h', 'm', 's'],
    });
  },

  jitter(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  mentionable(mention, target, message) {
    return mention === true ? `@${target} ${message}` : message;
  },

  relativeTime(then, specificity = 2, preferHours = false) {
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
  },

  usage(value, prefix, command) {
    if (!value || value.length === 0) return `${prefix}${command}`;
    const lines = Array.isArray(value) ? value : [value];
    return lines.map((line) => `${prefix}${command} ${line}`).join('\n');
  },

  variableInterval(callback, delay, wrapper) {
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
    self.wrapper = wrapper || function w() {
      callback();
      start();
    };
    start();
    self.clear = clear;
    return self;
  },
};
