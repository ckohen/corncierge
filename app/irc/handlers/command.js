'use strict';

const { Collection } = require('@discordjs/collection');
const util = require('../../util/UtilManager');

const TwitchCommand = require('../commands/TwitchCommand');

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
     * Whether the user that executed this command is the broadcaster
     * @type {boolean}
     */
    this.isBroadcaster = util.twitch.isBroadcaster(this.user, this.channel);

    /**
     * Whether the user that executed this command has moderation privileges
     * @type {boolean}
     */
    this.isPrivileged = privileged;

    /**
     * Whether the user that executed this command is vip
     * @type {boolean}
     */
    this.isVip = util.twitch.isVip(this.user);
    /**
     * The targetted user, simply the first arg when provided, otherwise the user executing
     * @type {string}
     */
    this.target = this.hasArgs ? args[0].replace(/^@/, '') : util.twitch.handle(this.user);

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
  respond(message, mention = false) {
    if (this.handled) return;
    if (!message) return;
    const replaceables = new Collection([
      ['user', util.twitch.handle(this.user)],
      ['touser', this.target],
      ['count', this.command.count],
      ['caster', this.channel.name],
      ['query', this.args.join(' ')],
    ]);
    this.socket.cache.variables.get(this.channel.name)?.forEach(variable => (replaceables[`var-${variable.name.toLowerCase()}`] = variable.value));

    const potentialReplaceables = [...message.matchAll(/{([^{}]*)}/g)];
    const defaultables = this.getDefaultableReplacements(potentialReplaceables, replaceables);
    const finalReplaceables = replaceables.concat(defaultables);

    this.socket.say(`#${this.channel.name}`, util.mentionable(this.isPrivileged && mention, this.target, util.format(message, finalReplaceables)));
  }

  /**
   * Generates the collection of replaceable keys in the message that may have default values
   * @param {RegExpMatchArray[]} potentials a list of all potential replaceable items in the message
   * @param {Collection<string,string>} existing a list of the existing replaceables to utilize when not defaulted
   * @returns {Collection<string,string>}
   * @private
   */
  getDefaultableReplacements(potentials, existing) {
    const replaceablesWithDefaults = ['touser', 'query'];
    const validatedPotentials = potentials.filter(([, key]) => replaceablesWithDefaults.some(defaultable => key.startsWith(`${defaultable}-`)));
    const replacements = new Collection();
    for (const [, key] of validatedPotentials) {
      if (replacements.has(key)) continue;
      const [type, ...additional] = key.split('-');
      replacements.set(key, this.hasArgs ? existing.get(type) : additional.join('-'));
    }
    return replacements;
  }
}

module.exports = CommandHandler;
