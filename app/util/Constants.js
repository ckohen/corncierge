'use strict';

const { Intents } = require('discord.js');

/**
 * Options for the application
 * @typedef {Object} ApplicationOptions
 * @property {DatabaseOptions} database options for database
 * @property {boolean} [debug=false] whether the application is in debug mode
 * @property {boolean} [disableDiscord=false] whether to disable discord (note: most of the functionality is dependent on discord)
 * @property {boolean} [disableIRC=false] whether to disable Twitch IRC
 * @property {boolean} [disableServer=false] whether to disable the built in HTTP server
 * @property {boolean} [disableTwitch=false] whether to completely disable twitch (forces disableIRC to true)
 * @property {string} [donate=https://www.paypal.me/corncierge] the donation link for your bot
 * @property {DiscordOptions} discord options for discord (does not need to be present if disableDiscord is true)
 * @property {HTTPOptions} [http] options for http (does not need to be present if disableServer is true)
 * @property {LogOptions} log options for logging
 * @property {string} [name=Corncierge] the name of the bot (used in help command)
 * @property {TwitchOptions} twitch options for twitch (does not need to be present if disableTwitch is true)
 * @property {string} [website=https://www.corncierge.com] the website to link to for more information on your bot
 */
exports.DefaultOptions = {
  debug: false,
  disableDiscord: false,
  disableIRC: false,
  disableServer: false,
  disableTwitch: false,
  donate: 'https://www.paypal.me/corncierge',
  name: 'Corncierge',
  website: 'https://www.corncierge.com',

  /**
   * The database options
   * @typedef {Object} DatabaseOptions
   * @property {string} database the name of the database within the server to use
   * @property {string} host the domain / ip of the database
   * @property {string} password the password used to log in to the database (DATABASE_PASSWORD in env if not provided)
   * @property {number} [port=3306] the port to attempt connections on
   * @property {string} [timezone=Z] the timezone to use
   * @property {string} user the user to log in as (DATABASE_USER in env if not provided)
   */
  database: {
    charset: 'utf8mb4_unicode_ci',
    port: 3306,
    timezone: 'Z',
  },

  /**
   * A disableable discord command, the top level is groups which disable the items within as well
   * * `all` - disables all built in commands
   * * `gaming`
   *  * `random`
   *  * `room`
   * * `general`
   *  * `help`
   * * `management`
   *  * `eval`
   *  * `setstatus`
   * * `moderation`
   *  * `clear`
   *  * `moveall`
   *  * `muteall`
   *  * `nuke`
   *  * `randommove`
   *  * `unmuteall`
   * * `roles`
   *  * `autorole`
   *  * `color`
   *  * `colormanager`
   *  * `makeme`
   *  * `makemenot`
   *  * `reactionroles`
   *  * `rolemanager`
   *  * `voceroles`
   * * `twitch`
   *  * `commandlist`
   *  * `commands`
   * @typedef {string} DisableableCommands
   */

  /**
   * The options for the discord handler
   * @typedef {Object} DiscordOptions
   * @property {discord.js.ClientOptions} [clientOptions] the options to pass to the djs client
   * @property {DisableableCommands[]} [disabledCommands] a list of commands to disable, for slash commands, this only needs to be set when registering
   * @property {string} token the token used to login to the bot application (DISCORD_TOKEN in env if not provided)
   */
  discord: {
    clientOptions: {
      partials: ['MESSAGE', 'REACTION'],
      allowedMentions: { parse: ['everyone', 'roles', 'users'], repliedUser: false },
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    },
    disabledCommands: [],
  },

  /**
   * The options for the built in web server
   * @typedef {Object} HTTPOptions
   * @property {number} [port=80] the port to listen on
   * @property {boolean} [useHttps=false] whether to use http or https
   * @property {https.ServerOptions} [httpsOptions] options to pass to the createServer call of https, must be provided when useHttps = true
   * @property {string} httpsOptions.keyLocation the location of the private key for https in PEM format
   * @property {string} httpsOptions.certLocation the location of the certificate chains for https in PEM format
   */
  http: {
    port: 80,
    useHttps: false,
  },

  /**
   * The logging options
   * @typedef {Object} LogOptions
   * @property {LogLevel} [maxLevel=error] the maximum level of logging to allow in the output file
   * @property {string} outputFile the location of the output file, either relative or direct path
   * @property {boolean} [verbose=false] whether to log verbose to the console
   * @property {string} webhookToken the token for the logging webhook (LOG_WEBHOOK_TOKEN in env if not provided)
   */
  log: {
    maxLevel: 'error',
    verbose: false,
  },

  /**
   * The options for the twitch handler
   * @typedef {Object} TwitchOptions
   * @property {string} [api=https://api.twitch.tv/kraken] Base url of the api
   * @property {string} [authapi=https://id.twitch.tv/oauth2] Base url for the authentication api
   * @property {string} [channel.id] the channel id for the 'default' listening twitch channel
   * @property {string} [channel.name] the channel name for the 'default' listening twitch channel
   * @property {string} clientId the id of the api application uses (TWITCH_CLIENT_Id in env if not provided)
   * @property {string} clientSecret the client secret for the api application (TWITCH_CLIENT_SECRET in env if not provided)
   * @property {IRCOptions} [irc] options for the irc client
   * @property {ThrottleOptions} [ircThrottle] options for throttling irc commands
   * @property {Object} [headers] extra headers to pass to the twitch api on every request
   * @property {string} redirectUri a registered redirect URI for your application
   */
  twitch: {
    api: 'https://api.twitch.tv/helix',
    authapi: 'https://id.twitch.tv/oauth2',

    /**
     * IRC connection options for tmi.js
     * @typedef {Object} IRCConnectionOptions
     * @property {string} [server=irc-ws.chat.twitch.tv] the server to connect to
     * @property {number} [port=80] the port to connect on
     * @property {boolean} [reconnect=true] whether to attempt reconnections automatically
     * @property {number} [maxReconnectAttempts=Infinity] max number of reconnect attempts
     * @property {number} [maxReconnectInterval=30000] max time to delay between reconnects
     * @property {number} [reconnectDecay=1.5] the rate of increase of the reconnect delay
     * @property {number} [reconnectInterval=1000] number of ms before attempting to reconnect
     * @property {boolean} [secure=false] Use SSL/HTTPS (overrides prt to 443)
     * @property {number} [timeout=9999] how long to wait for response from server
     */

    /**
     * IRC connection options (these are tmi.js options)
     * @typedef {Object} IRCOptions
     * @property {string} [botId] the id of the bot that posts in chat
     * @property {IRCConnectionOptions} [connection] the options for the IRC Connection
     * @property {boolean} [options.debug] whether the irc client is in debug mode
     * @property {string} [identity.username] the username of the bot that posts in chat
     * @property {string|Function} [identity.password=auth.getAccessToken] the password or a password generator function
     * @property {string[]} [channels] list of channels to join on startup
     * @property {boolean} [options.skipMembership=true] whether to stop recieving JOIN / PART messages for other users
     * @property {boolean} [options.skipUpdatingEmotesets=false] whether to skip calling the emoticon_images API
     * @property {number|boolean} [options.updateEmotesetsTimer=false] how long to wait between automatic updates of emote sets
     */
    irc: {
      options: {
        skipMembership: true,
        updateEmotesetsTimer: false,
      },
    },

    /**
     * Options for throttling commands in IRC
     * @typedef {Object} ThrottleOptions
     * @property {number} [burst=1] how many time to allow a command in short bursts
     * @property {number} [rate=1] the number of actions renewed per window
     * @property {number} [window=30000] the time frame which rate and burst act in
     * @property {Object} [overrides] an object linking command names to their burst, rate, and window overrides
     */
    ircThrottle: {
      burst: 1,
      rate: 1,
      window: 30000,
    },
  },
};

/**
 * Predefined custom colors for use anywhere
 * * `BRIGHT_GREEN`
 * * `BRIGHT_PINK`
 * * `BRIGHT_PURPLE`
 * * `CYAN`
 * * `DEEP_GOLD`
 * * `SALMON`
 * * `TWITCH`
 * @typedef {Object} Colors
 */
exports.Colors = {
  BRIGHT_GREEN: 0x00ff00,
  BRIGHT_PINK: 0xff0080,
  BRIGHT_PURPLE: 0x8000ff,
  BRIGHT_RED: 0xff0000,
  CYAN: 0x00ffff,
  DEEP_GOLD: 0xffab32,
  SALMON: 0xff7373,
  TWITCH: 0x9146ff,
};

exports.discordMessages = {
  ban(user, moderator, reason) {
    return `**${user}** was banned by **${moderator}** ${reason}`;
  },

  banAutomatic(user) {
    return `**${user}** was banned automatically`;
  },

  delete(user, moderator) {
    return `A message from **${user}** was deleted by **${moderator}**`;
  },

  deleteAutomatic(user) {
    return `A message from **${user}** was deleted automatically`;
  },

  review(user) {
    return `A message from **${user}** may require moderation`;
  },

  timeout(user, moderator, duration, reason) {
    return `**${user}** was timed out for ${duration} by **${moderator}** ${reason}`;
  },

  timeoutAutomatic(user, duration) {
    return `**${user}** was timed out for ${duration} automatically`;
  },

  unban(user, moderator) {
    return `**${user}** was pardoned by **${moderator}**`;
  },

  streamUp(role, userLogin, title_url) {
    return `Hey ${role}, ${userLogin} is now live at <${title_url}>! Go check it out!`;
  },

  streamDown(userLogin) {
    return `${userLogin} has finished streaming :)`;
  },
};

exports.ComponentFunctions = createEnum(['ROLE_ASSIGN']);

exports.IRCFilterTypes = {
  BAN: 1,
  TIMEOUT: 2,
  DELETE: 3,
  WARNING: 4,
  REVIEW: 5,
};

exports.IRCResponders = {
  followage(user, date, duration) {
    return `${user} has been following {caster} since ${date} (${duration})`;
  },

  uptime(duration) {
    return `{caster} has been live for ${duration}`;
  },
};

exports.LogColors = {
  critical: 'bold white redBG',
  error: 'red',
  warn: 'yellow',
  status: 'cyan',
  info: 'cyan',
  debug: 'green',
  verbose: 'blue',
};

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
exports.LogLevels = {
  console: {
    critical: 0,
    error: 1,
    warn: 2,
    status: 3,
    info: 4,
    debug: 5,
    verbose: 6,
  },
  webhook: {
    status: 'BRIGHT_GREEN',
    error: 'BRIGHT_RED',
    warn: 'DEEP_GOLD',
  },
};

function createEnum(keys) {
  const obj = {};
  for (const [index, key] of keys.entries()) {
    if (key === null) continue;
    obj[key] = index;
    obj[index] = key;
  }
  return obj;
}
