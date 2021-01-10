'use strict';

const noop = () => {}; // eslint-disable-line no-empty-function
const reflectors = ['toString', 'valueOf', 'inspect', 'constructor', Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')];
const levels = Object.keys(require('../util/Constants').LogLevels.console);

/**
 * @classdesc Not a real class, a proxy for the {@link LogManager} levels
 * @class
 * @name Logging
 */

/**
 * The level of log to make, one of {@link LogLevel}
 * @name Logging#[level]
 * @type {Logging}
 * @readonly
 * @static
 */

/**
 * Calls the logger at the previously specified level, if none was specified, this is `info`
 * @function Logging#*
 * @param {Module} source the module sourcing this log
 * @param {string} message the message to output
 */

function buildLog(app) {
  let level = '';
  const handler = {
    get(target, name) {
      if (reflectors.includes(name)) return () => level;
      level = name;
      return new Proxy(noop, handler);
    },
    apply(target, _, args) {
      if (level === 'fatal') {
        app.logger.fatal('critical', ...args);
      } else if (levels.includes(level)) {
        app.logger.out(level, ...args);
      } else {
        app.logger.out('info', ...args);
      }
    },
  };
  return new Proxy(noop, handler);
}

module.exports = buildLog;
