'use strict';

const noop = () => {}; // eslint-disable-line no-empty-function
const reflectors = ['toString', 'valueOf', 'inspect', 'constructor', Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')];

/**
 * A level of logging based on the following:
 * * fatal - a critical error that ends the application
 * * critical - potentially breaking issue
 * * error - high priority non-breaking issue
 * * warn - non-breaking issue
 * * info - general information
 * * debug - highly detailed debug information
 * * verbose - clutters the log
 * @typedef {string} LogLevel
 */

/**
 * @classdesc Not a real class, a proxy for the {@link LogManager} levels
 * @class
 * @name Logging
 */

/**
 * @memberof Logging
 * @property {Logging} level the level of log to make
 */

/**
 * Calls the logger at the previously specified level, if none was specified, this is `info`
 * @function *
 * @memberof Logging
 * @param {Module} source the module sourcing this log
 * @param {string} message the message to output
 */

function buildLog(app) {
  const levels = Object.keys(app.options.log.levels);
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
