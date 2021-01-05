'use strict';

const axios = require('axios');
const moment = require('moment');
const wn = require('winston');
const BaseManager = require('./BaseManager');

/**
 * Log manager for the application.
 * @extends {BaseManager}
 */
class LogManager extends BaseManager {
  constructor(app) {
    super(
      app,
      wn.createLogger({
        levels: app.options.log.levels,
        format: wn.format.combine(
          wn.format.colorize(),
          wn.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          wn.format.printf(info => `${info.timestamp} ${info.level} ${info.message}`),
        ),
        transports: [
          new wn.transports.Console({
            level: app.options.log.verbose ? 'verbose' : app.debug ? 'debug' : 'error',
            handleExceptions: true,
          }),
          new wn.transports.File({
            handleExceptions: true,
            filename: app.options.log.outputFile,
            level: app.options.log.maxLevel,
          }),
        ],
      }),
      app.options.log,
    );

    /**
     * The log driver.
     * @type {Winston}
     * @name LogManager#driver
     * @private
     */

    wn.addColors(this.options.colors);
  }

  /**
   * Write a message to the log.
   * @param {LogLevel} level the log level
   * @param {Module} source the module sourcing this log
   * @param {string} message the message to output
   */
  async out(level, source, message) {
    const path = this.path(source);
    this.driver.log(level, `[${path}] ${message}`);
    if (this.options.webhookLevels[level]) {
      await this.webhook(level, path, message);
    }
  }

  /**
   * Exit the process after writing a message to the log.
   * @param {LogLevel} level the log level
   * @param {Module} source the module sourcing this log
   * @param {string} message the message to output
   */
  async fatal(level, source, message) {
    const path = this.path(source);
    await this.out(level, path, message);
    this.app.end(1);
  }

  /**
   * Send a log message via webhook.
   * @param {LogLevel} level the log level
   * @param {string} path the path to the module that this occured in
   * @param {string} message the message to send
   * @returns {Promise<axiosRequest, axiosResponse>}
   * @private
   */
  webhook(level, path, message) {
    const levels = this.options.webhookLevels;

    if (!Object.prototype.hasOwnProperty.call(levels, level)) return Promise.reject(new Error('Invalid level'));

    return axios({
      method: 'POST',
      baseURL: this.options.webhookBase,
      url: this.options.webhookToken.toString(),
      data: {
        embeds: [
          {
            description: typeof message === 'string' ? message : String(message),
            timestamp: moment().utcOffset(0).format(),
            title: `${level} \u00B7 ${path}`,
            color: this.app.options.discord.colors[levels[level] || 'aqua'],
          },
        ],
      },
    }).catch(err => {
      this.driver.log('error', `[${this.path(module)}] Failed to send webhook: ${err}`);
    });
  }

  /**
   * Calculate the path of the given source module.
   * @param {Module} source the module that made this log
   * @returns {string}
   * @private
   */
  path(source) {
    if (!source.id) return source;
    /* eslint-disable-next-line newline-per-chained-call */
    return source.id.split('.').shift().replace(`${this.app.options.basepath}/`, '').replace(/\//g, '.');
  }
}

module.exports = LogManager;
