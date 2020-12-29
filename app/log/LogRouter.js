'use strict';

const noop = () => {}; // eslint-disable-line no-empty-function
const reflectors = ['toString', 'valueOf', 'inspect', 'constructor', Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')];

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
