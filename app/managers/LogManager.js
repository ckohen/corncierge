'use strict';

const util = require('util');
const { WebhookClient, MessageEmbed, MessageAttachment } = require('discord.js');
const wn = require('winston');
const BaseManager = require('./BaseManager');
const Constants = require('../util/Constants');

/**
 * Log manager for the application.
 * @extends {BaseManager}
 */
class LogManager extends BaseManager {
  constructor(app) {
    super(
      app,
      wn.createLogger({
        levels: Constants.LogLevels.console,
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

    wn.addColors(Constants.LogColors);

    /**
     * The webhook client that handles sending error logs to discord
     * @type {WebhookClient}
     * @private
     */
    this.webhookClient = new WebhookClient(...this.options.webhookToken.split('/'));
  }

  /**
   * Write a message to the log.
   * @param {LogLevel} level the log level
   * @param {Module} source the module sourcing this log
   * @param {string} [message] the message to output
   * @param {Error} [error] the full error object to use for a stacktrace
   */
  async out(level, source, message = 'No message specified', error) {
    const path = this.path(source);
    if (!error && message instanceof Error) {
      error = message;
      message = '';
    }
    let formattedError = '';
    if (error) {
      formattedError = util.inspect(error, { depth: 6, colors: true });
    }
    this.driver.log(level, `[${path}] ${message}${message && formattedError ? `: ` : ''}${formattedError}`);
    if (Constants.LogLevels.webhook[level]) {
      await this.webhook(level, path, message, error);
    }
  }

  /**
   * Exit the process after writing a message to the log.
   * @param {LogLevel} level the log level
   * @param {Module} source the module sourcing this log
   * @param {string} [message] the message to output
   * @param {Error} [error] the full error object to use for a stacktrace
   */
  async fatal(level, source, message = 'No message specified', error) {
    const path = this.path(source);
    await this.out(level, path, message, error);
    this.app.end(1);
  }

  /**
   * Send a log message via webhook.
   * @param {LogLevel} level the log level
   * @param {string} path the path to the module that this occured in
   * @param {string} message the message to send
   * @param {Error} [error] the full error object to use for a stacktrace
   * @returns {Promise<axiosRequest, axiosResponse>}
   * @private
   */
  webhook(level, path, message, error) {
    const levels = Constants.LogLevels.webhook;

    if (!Object.prototype.hasOwnProperty.call(levels, level)) return Promise.reject(new Error('Invalid level'));

    if (!error && message instanceof Error) {
      error = message;
      message = '';
    }
    let formattedError;
    if (error) {
      formattedError = util.inspect(error, { depth: 6 });
    }

    let formatted = typeof message === 'string' ? message : String(message);
    if (formattedError) {
      formatted += `: ${formattedError}`;
    }
    formatted = formatted.split('\n').slice(0, 4);
    let code = false;
    for (const i in formatted) {
      let line = formatted[i];
      if (line.trim().startsWith('at')) {
        formatted[i] = `\`\`\`ada\n${line}`;
        code = true;
        break;
      }
    }
    formatted = `${formatted.join('\n')}${code ? '```' : ''}`;

    const embed = new MessageEmbed()
      .setDescription(formatted)
      .setTimestamp(Date.now())
      .setTitle(`${level} \u00B7 ${path}`)
      .setColor(Constants.Colors[levels[level] || 'CYAN']);

    const attachments = [embed];

    if (error?.stack && formattedError.length > 100) {
      attachments.push(new MessageAttachment(Buffer.from(formattedError), 'stacktrace.ada'));
    }
    return this.webhookClient.send(attachments).catch(err => this.driver.log('error', `[${this.path(module)}] Failed to send webhook: ${err}`));
  }

  /**
   * Calculate the path of the given source module.
   * @param {Module} source the module that made this log
   * @returns {string}
   * @private
   */
  path(source) {
    if (!source.id) return source;
    return source.id
      .split('.')
      .shift()
      .replace(`${this.app.options.basepath}/`, '')
      .replace(`${this.app.options.basepath.split('node_modules')[0]}`, '')
      .replace(/\//g, '.');
  }
}

module.exports = LogManager;
