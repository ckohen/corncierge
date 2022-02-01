'use strict';

const { Collection } = require('@discordjs/collection');
const util = require('../../util/UtilManager');

const TwitchCommand = require('../commands/TwitchCommand');

const replaceablesWithDefaults = ['touser', 'query'];

const followProperties = ['followerCount'];
const userProperties = ['createdAt', 'displayName', ...followProperties];
const subscriptionProperties = ['subscriberCount', 'subscriptionPoints'];
const channelProperties = ['title', 'category', ...subscriptionProperties];
const tagProperties = ['tags'];
const streamProperties = ['startedAt', 'uptime', ...tagProperties];

/**
 * The interface for any recieved twitch command
 */
class CommandHandler {
  constructor(socket, channel, user, command, args, privileged) {
    Object.defineProperties(this, {
      /**
       * The twitch manager that is executing this command
       * @name CommandHandler#socket
       * @type {IrcManager}
       */
      socket: { value: socket },

      /**
       * The name and id of the channel that the command was executed in
       * @name CommandHandler#channel
       * @type {TwitchChannel}
       */
      channel: { value: channel },

      /**
       * The user that executed the command
       * @name CommandHandler#user
       * @type {Object}
       */
      user: { value: user },

      /**
       * The database row that the command identified to
       * @name CommandHandler#command
       * @type {Object}
       */
      command: { value: command },

      /**
       * The content of the message split on spaces excluding the command name
       * @name CommandHandler#args
       * @type {string[]}
       */
      args: { value: args },
    });

    /**
     * Whether the user that executed this command has moderation privileges
     * @type {boolean}
     */
    this.isPrivileged = privileged;

    /**
     * The command executor if the command is handled by a responder
     * @type {?TwitchCommand}
     */
    this.executor = null;

    /**
     * Whether this command has already been handled
     * @type {boolean}
     */
    this.handled = false;

    /**
     * Base replaceables
     * @type {Collection<string,string>}
     * @private
     */
    this._replaceables = new Collection([
      ['user', util.twitch.handle(this.user)],
      ['touser', this.target],
      ['count', this.command.count],
      ['caster', this.channel.name],
      ['query', this.args.join(' ')],
    ]);

    /**
     * Prefetched data cached for this command handler only
     * @type {Record<string,Map>}
     * @private
     */
    this._prefetch = {
      user: null,
      follow: null,
      channel: null,
      subscription: null,
      stream: null,
      tag: null,
    };
  }

  /**
   * Whether arguments were provided with this exectuion
   * @type {boolean}
   * @readonly
   */
  get hasArgs() {
    return this.args.length > 0;
  }

  /**
   * Whether the user that executed this command is the broadcaster
   * @type {boolean}
   * @readonly
   */
  get isBroadcaster() {
    return util.twitch.isBroadcaster(this.user, this.channel);
  }

  /**
   * Whether the user that executed this command is vip
   * @type {boolean}
   * @readonly
   */
  get isVip() {
    return util.twitch.isVip(this.user);
  }

  /**
   * The targetted user, simply the first arg when provided, otherwise the user executing
   * @type {string}
   * @readonly
   */
  get target() {
    return this.hasArgs ? this.args[0].replace(/^@/, '') : util.twitch.handle(this.user);
  }

  /**
   * Executes the command handled by this handler
   * @private
   */
  execute() {
    const commands = this.socket.commandResponders.registered;
    if (this.command.level) {
      switch (this.command.level) {
        case 'broadcaster':
          if (!this.isBroadcaster) return;
          break;
        case 'moderator':
          if (!this.isPrivileged) return;
          break;
        case 'vip':
          if (!(this.isPrivileged || this.isVip)) return;
          break;
        default:
      }
      this.command.count += 1;
      this.socket.app.database.tables.ircCommands.edit('count', this.command.id);
    }

    if (this.command.method !== null && commands.get(this.command.method) instanceof TwitchCommand) {
      this.executor = commands.get(this.command.method);
    }

    if (this.isPrivileged || this.isVip) {
      // Handle immediately if user is privileged or VIP
      this.handle();
      return;
    }

    // Throttle command usage
    this.socket.throttle.rateLimit(this.command.input, (err, limited) => {
      if (err) return this.socket.app.log.error(module, `Throttle: ${err}`);
      if (limited) return this.socket.app.log.debug(module, `Throttled command: ${this.command.input}`);

      // Handle command
      return this.handle();
    });
  }

  /**
   * Handle actual command execution
   * @private
   */
  async handle() {
    if (!this.executor) {
      this.respond(this.command.output, this.command.mention);
      this.handled = true;
      return;
    }
    // Handle computed responses
    setTimeout(() => {
      if (!this.handled) {
        this.respond(this.command.output, this.command.mention);
        this.handled = true;
      }
    }, 2500);
    const handled = await this.executor.run(this, this.hasArgs && this.isPrivileged);
    if (!handled) this.respond(this.command.output, this.command.mention);
    this.handled = true;
  }

  /**
   * Responds to the command with formatted content (can be used multiple times)
   * @param {string} message the message to say
   * @param {boolean} [mention=false] whether to mention the targetted user
   */
  async respond(message, mention = false) {
    if (this.handled) return;
    if (!message) return;
    this.socket.cache.variables.get(this.channel.name)?.forEach(variable => (replaceables[`var-${variable.name.toLowerCase()}`] = variable.value));

    const potentialReplaceables = [...message.matchAll(/{([^{}]*)}/g)];
    const defaultables = this.getDefaultableReplacements(potentialReplaceables);
    const twitchReplacements = await this.getTwitchReplacements(potentialReplaceables).catch(err => {
      this.socket.say(`#${this.channel.name}`, err.message);
      this.socket.app.log.verbose(module, 'Early exit on respond due to error with twitch', err);
    });
    if (!twitchReplacements) return;
    const replaceables = this._replaceables.concat(defaultables, twitchReplacements);

    this.socket.say(`#${this.channel.name}`, util.mentionable(this.isPrivileged && mention, this.target, util.format(message, replaceables)));
  }

  /**
   * Generates the collection of replaceable keys in the message that may have default values
   * @param {RegExpMatchArray[]} potentials a list of all potential replaceable items in the message
   * @returns {Collection<string,string>}
   * @private
   */
  getDefaultableReplacements(potentials) {
    const replacements = new Collection();
    for (const [, key] of potentials) {
      if (!replaceablesWithDefaults.some(defaultable => key.startsWith(`${defaultable}-`))) continue;
      if (replacements.has(key)) continue;
      const [type, ...additional] = key.split('-');
      replacements.set(key, this.hasArgs ? this._replaceables.get(type) : additional.join('-'));
    }
    return replacements;
  }

  /**
   * Generates the collection of replaceable keys in the message that are from twitch
   * keys start with on of the following
   * User scope:
   * * `twitch.user.followerCount`, `twitch.user.createdAt`, `twitch.user.displayName`
   * Channel scpope:
   * * `twitch.channel.title`, `twitch.channel.category`, `twitch.channel.subscriberCount`, `twitch.channel.subscriptionPoints`
   * Stream scope:
   * * `twitch.stream.startedAt`, `twitch.stream.uptime`, `twitch.stream.tags`
   * @param {RegExpMatchArray[]} potentials a list of all potential replaceable items in the message
   * @returns {Collection<string,string>}
   * @private
   */
  async getTwitchReplacements(potentials) {
    const replacements = new Collection();
    const addReplacement = (key, value, time = false) => {
      let formattedValue = value;
      if (time) {
        formattedValue = `${util.humanDate(value)} (${util.relativeTime(value, 4)})`;
      }
      replacements.set(key, formattedValue);
    };
    for (const [, key] of potentials) {
      if (!key.startsWith('twitch.')) continue;
      if (replacements.has(key)) continue;
      const [stringAccess, rawUser, rawDefault] = key.split(' ');
      const user = rawUser ? this._convertStandardReplaceables(rawUser, ['user', 'touser', 'caster']) : rawUser ?? null;
      const def = rawDefault ? this._convertStandardReplaceables(rawDefault, ['user', 'caster']) : rawDefault ?? this._replaceables.get('caster');
      // eslint-disable-next-line no-await-in-loop
      const userId = await this._getId(user ?? def);
      const [, structure, property] = stringAccess.split('.');
      let reformattedProperty;
      let isTime = false;
      if (property.endsWith('At')) {
        reformattedProperty = `${property.slice(0, -2)}Timestamp`;
        isTime = true;
      }
      switch (structure) {
        case 'user': {
          if (!userProperties.includes(property)) continue;
          const resolvedStructure = followProperties.includes(property) ? 'follow' : structure;
          const resolvedProperty = reformattedProperty ?? (property === 'followerCount' ? 'total' : property);
          // eslint-disable-next-line no-await-in-loop
          const data = await this._fetchFromTwitch(user ?? def, userId, resolvedStructure, resolvedProperty);
          addReplacement(key, data, isTime);
          break;
        }
        case 'channel': {
          if (!channelProperties.includes(property)) continue;
          const resolvedStructure = subscriptionProperties.includes(property) ? 'subscription' : structure;
          let resolvedProperty = reformattedProperty ?? property;
          if (resolvedProperty === 'subscriberCount') {
            resolvedProperty = 'total';
          } else if (resolvedProperty === 'subscriptionPoints') {
            resolvedProperty = 'points';
          }
          // eslint-disable-next-line no-await-in-loop
          const data = await this._fetchFromTwitch(user ?? def, userId, resolvedStructure, resolvedProperty);
          addReplacement(key, resolvedProperty === 'category' ? data.name : data, isTime);
          break;
        }
        case 'stream': {
          if (!streamProperties.includes(property)) continue;
          const resolvedStructure = tagProperties.includes(property) ? 'tag' : structure;
          let resolvedProperty = reformattedProperty ?? property;
          if (resolvedProperty === 'tags') {
            resolvedProperty = undefined;
          }
          // eslint-disable-next-line no-await-in-loop
          const data = await this._fetchFromTwitch(user ?? def, userId, resolvedStructure, resolvedProperty);
          let finalData = data;
          if (resolvedStructure === 'tag') {
            switch (data.size) {
              case 0:
                finalData = 'No tags';
                break;
              case 1:
                finalData = data.first().name;
                break;
              case 2:
                finalData = `${data.first().name} and ${data.last().name}`;
                break;
              default:
                finalData = [...data.values].reduce((prev, curr, ind) => `${prev}${ind === 0 ? '' : ', '}${ind === data.size - 1 ? 'and ' : ''}${curr}`, '');
            }
          }

          if (resolvedProperty === 'uptime') {
            finalData = util.relativeTime(data, 3, undefined, true);
          }

          addReplacement(key, finalData, isTime);
          break;
        }
      }
    }
    return replacements;
  }

  /**
   * Gets cached or fetch twitch user id for a username
   * @param {string} name the name of the user to get id for
   * @returns {string}
   */
  async _getId(name) {
    const cachedId = this.socket.channelIds.get(name);
    if (cachedId) return cachedId;
    const userData = await this.socket.twitch.driver.users.fetch({ logins: [name] });
    if (!userData) {
      throw new Error(`User ${name} does not appear to exist`);
    }
    this.socket.channelIds.set(name, userData.id);
    return userData.id;
  }

  /**
   * Get some data for replacement from twitch
   * @param {string} username the name of the user to fetch for
   * @param {string} userId the id of the user to fetch for
   * @param {string} structure structure type to be fetched
   * @param {string} [property] property to get from the structure, only optional for tag structure
   * @returns {unknown}
   */
  async _fetchFromTwitch(username, userId, structure, property) {
    const preFetched = this._prefetch[structure] ?? (this._prefetch[structure] = new Map());
    if (preFetched.has(userId)) {
      if (property) {
        const prop = preFetched.get(userId)[property];
        if (prop) return prop;
      } else {
        return preFetched.get(userId);
      }
    }
    const client = this.socket.twitch.driver;
    switch (structure) {
      case 'user': {
        let fetched = await client.users.fetch({ ids: [userId] }).catch(err => this.socket.app.log.debug(module, err));
        if (fetched && fetched[property] === null) {
          fetched = await fetched.fetch();
        }
        if (!fetched) throw new Error(`Could not find user ${username}`);
        preFetched.set(userId, fetched);
        return fetched[property];
      }
      case 'follow': {
        if (property !== 'total') {
          this.socket.app.log.warn(module, `Unexpected property in follow fetch ${property}`);
          throw new Error(`Encountered an unexpected error, this has been logged and will be fixed shortly`);
        }
        const fetched = await client.users.fetchFollows({ streamer: userId, resultCount: 1 }).catch(err => this.socket.app.log.debug(module, err));
        if (!fetched || !fetched[property]) throw new Error(`Not enough data to determine follower count for ${username}`);
        preFetched.set(userId, fetched);
        return fetched[property];
      }
      case 'channel': {
        const fetched = await client.channels.fetch(userId, { force: true }).catch(err => this.socket.app.log.debug(module, err));
        if (!fetched) throw new Error(`Could not find channel ${username}`);
        preFetched.set(userId, fetched);
        return fetched[property];
      }
      case 'subscription': {
        if (!['total', 'points'].includes(property)) {
          this.socket.app.log.warn(module, `Unexpected property in subscription fetch ${property}`);
          throw new Error(`Encountered an unexpected error, this has been logged and will be fixed shortly`);
        }
        const fetched = await client.channels.fetchSubscriptions(userId, { resultCount: 1 }).catch(err => this.socket.app.log.debug(module, err));
        if (!fetched || !fetched[property]) {
          throw new Error(`Not enough data or no permission to determine subscriber ${property === 'total' ? 'count' : property} for ${username}`);
        }
        preFetched.set(userId, fetched);
        return fetched[property];
      }
      case 'stream': {
        const fetched = await client.streams.fetch({ userIds: [userId], force: true }).catch(err => this.socket.app.log.debug(module, err));
        if (!fetched) throw new Error(`Could not get stream data for ${username} (likely not live)`);
        preFetched.set(userId, fetched);
        return fetched[property];
      }
      case 'tag': {
        const fetched = await client.streams.fetchTags(userId).catch(err => this.socket.app.log.debug(module, err));
        if (!fetched) throw new Error(`Could not fetch tags for ${username}`);
        preFetched.set(userId, fetched);
        return fetched;
      }
    }
    this.socket.app.log.warn(module, `Unexpected structure in fetch ${structure}`);
    throw new Error(`Encountered an unexpected error, this has been logged and will be fixed shortly`);
  }

  /**
   * Convert a singleton replacement type string with the non standard edges ()
   * @param {string} toReplace the string to get replacements for
   * @param {string[]} allowedReplacements the generic replacements to allow
   * @returns {string|null}
   * @private
   */
  _convertStandardReplaceables(toReplace, allowedReplacements = []) {
    if (!toReplace.startsWith('(')) return toReplace;
    if (!toReplace.endsWith(')')) return toReplace;
    for (const replacement of allowedReplacements) {
      if (toReplace !== `(${replacement})`) continue;
      if (replacement === 'touser' && !this.hasArgs) return null;
      return this._replaceables.get(replacement);
    }
    return null;
  }
}

module.exports = CommandHandler;
