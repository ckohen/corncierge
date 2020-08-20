'use strict';

const Ws = require('ws');
const uuid = require('uuid/v4');

const events = require('./events');
const topics = require('./topics');
const Socket = require('../Socket');

/**
 * PubSub manager for the application.
 * @extends {Socket}
 * @private
 */
class PubSubManager extends Socket {
  /**
   * Create a new PubSub manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    super();

    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The socket nonce.
     * @type {string}
     */
    this.nonce = uuid();

    /**
     * The socket events.
     * @type {Object}
     */
    this.events = events;

    /**
     * The socket topics.
     * @type {Function<Object>}
     */
    this.topics = topics(this.app.options);

    /**
     * The PubSub driver.
     * @type {?WebSocket}
     */
    this.driver = null;
  }

  /**
   * Initialize the manager.
   * @returns {self}
   */
  init() {
    this.driver = new Ws(this.app.options.pubsub.url, this.app.options.pubsub.options);
    this.attach();
    return this;
  }

  /**
   * Find and call a topic handler by the given key.
   * @param {string} key
   * @param {Object} payload
   */
  topic(key, payload) {
    const topic = this.topics.find((t) => t.topic === key);

    if (typeof topic === 'undefined' || typeof topic.handler !== 'function') {
      this.app.log.out('warn', module, `Unknown topic: ${key}`);
      return;
    }

    topic.handler(this, JSON.parse(payload));
  }
}

module.exports = PubSubManager;
