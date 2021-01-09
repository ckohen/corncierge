'use strict';

/**
 * Options for the application
 * @typedef {Object} ApplicationOptions
 * @property {DatabaseOptions} database options for database
 * @property {boolean} [debug=false] whether the application is in debug mode
 * @property {boolean} [disableDiscord=false] whether to disable discord (note: most of the functionality is dependent on discord)
 * @property {boolean} [disableIRC=false] whether to disable Twitch IRC
 * @property {boolean} [disableServer=false] whether to disable the built in HTTP server
 * @property {boolean} [disableTwitch=false] whether to completely disable twitch (forces disableIRC to true)
 * @property {DiscordOptions} discord options for discord (does not need to be present if disableDiscord is true)
 * @property {HTTPOptions} [http] options for http (does not need to be present if disableServer is true)
 * @property {LogOptions} log options for logging
 * @property {TwitchOptions} twitch options for twitch (does not need to be present if disableTwitch is true)
 * @property {string} [youtubeToken] the token used for connecting to youtubes API (for music bot)
 */
exports.DefaultOptions = {
  debug: false,
  disableDiscord: false,
  disableIRC: false,
  disableServer: false,
  disableTwitch: false,

  /**
   * The database options
   * @typedef {Object} DatabaseOptions
   * @property {string} database the name of the database within the server to use
   * @property {string} host the domain / ip of the database
   * @property {string} password the password used to log in to the database
   * @property {number} [port=3306] the port to attempt connections on
   * @property {string} [timezone='Z'] the timezone to use
   * @property {string} user the user to log in as
   */
  database: {
    charset: 'utf8mb4_unicode_ci',
    port: 3306,
    timezone: 'Z',
  },

  /**
   * A disableable discord command, some are groups which disable the items within as well
   * @typedef {string} DisableableCommands
   */

  /**
   * The options for the discord handler
   * @typedef {Object} DiscordOptions
   * @property {discord.js.ClientOptions} [clientOptions] the options to pass to the djs client
   * @property {DisableableCommands[]} [disabledCommands] a list of commands to disable, for slash commands, this only needs to be set when registering
   * @property {string} token the token used to login to the bot application
   */
  discord: {
    clientOptions: {
      partials: ['MESSAGE', 'REACTION'],
    },
    disabledCommands: [],
  },

  /**
   * The options for the built in web server
   * @typedef {Object} HTTPOptions
   * @property {number} [port=80] the port to listen on
   */
  http: {
    port: 80,
  },

  /**
   * The logging options
   * @typedef {Object} LogOptions
   * @property {LogLevel} [maxLevel='error'] the maximum level of logging to allow in the output file
   * @property {string} outputFile the location of the output file, either relative or direct path
   * @property {boolean} [verbose=false] whether to log verbose to the console
   * @property {string} [webhookBase='https://discord.com/api/webhooks'] the webhook base url for discord webhooks
   * @property {string} webhookToken the token for the logging webhook
   */
  log: {
    maxLevel: 'error',
    verbose: false,
    webhookBase: 'https://discord.com/api/webhooks',
  },

  /**
   * The options for the twitch handler
   * @typedef {Object} TwitchOptions
   * @property {string} [api='https://api.twitch.tv/kraken'] Base url of the api
   * @property {string} [authapi='https://id.twitch.tv/oauth2'] Base url for the authentication api
   * @property {string} [botCode] the code used to generate tokens for the bot user, must have tokens or code in the database if not provided
   * @property {string} [channel.id] the channel id for the 'default' listening twitch channel
   * @property {string} [channel.name] the channel name for the 'default' listening twitch channel
   * @property {string} clientID the id of the api application
   * @property {string} clientSecret the client secret for the api application
   * @property {IRCOptions} [irc] options for the irc client
   * @property {ThrottleOptions} [ircThrottle] options for throttling irc commands
   * @property {string} redirectUri a registered redirect URI for your application
   */
  twitch: {
    api: 'https://api.twitch.tv/kraken/',
    authapi: 'https://id.twitch.tv/oauth2',
    headers: {
      Accept: 'application/vnd.twitchtv.v5+json',
    },

    /**
     * IRC connection options for tmi.js
     * @typedef {Object} IRCConnectionOptions
     * @property {string} [server='irc-ws.chat.twitch.tv'] the server to connect to
     * @property {number} [port=80] the port to connect on
     * @property {boolean} [reconnect=true] whether to attempt reconnections automatically
     * @property {number} [maxReconnectAttempts=Infinity] max number of reconnect attempts
     * @property {number} [maxReconnectInterval=30000] max time to delay between reconnects
     * @property {number} [reconnectDecay=1.5] the rate of increase of the reconnect delay
     * @property {number} [reconnectInterval=1000] number of ms before attempting to reconnect
     * @property {boolean} [secure=false] Use SSL/HTTPS (overrides prt to 443)
     * @property {number} [timeout=9999] how lkong to wait for response from server
     */

    /**
     * IRC connection options (these are tmi.js options)
     * @typedef {Object} IRCOptions
     * @property {IRCConnectionOptions} [connection] the options for the IRC Connection
     * @property {boolean} [options.debug] whether the irc client is in debug mode
     * @property {string} [identity.username] the username of the bot that posts in chat
     * @property {string|Function} [indetity.password=auth.getAccessToken] the password or a password generator function
     * @property {string[]} [channels] list of channels to join on startup
     */
    irc: {
      connection: {
        reconnect: true,
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
      windows: 30000,
    },
  },
};

/**
 * The available predefined colors for discord embeds
 * * aqua
 * * blue
 * * cyan
 * * gold
 * * green
 * * orange
 * * pink
 * * purple
 * * red
 * * twitch
 * * yellow
 * @typedef {Object} EmbedColors
 */
exports.EmbedColors = {
  aqua: 0x2ec6cc,
  blue: 0x0080ff,
  cyan: 0x00ffff,
  delete: 0x01b8c3,
  gold: 0xffab32,
  green: 0x00ff00,
  music: 0xe9f931,
  orange: 0xff8000,
  pink: 0xff0080,
  purple: 0x8000ff,
  queue: 0xff7373,
  red: 0xff0000,
  twitch: 0x9146ff,
  yellow: 0xffff00,
};

exports.LogColors = {
  critical: 'bold white redBG',
  error: 'red',
  warn: 'yellow',
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
    info: 3,
    debug: 4,
    verbose: 5,
  },
  webhook: {
    error: 'red',
    warn: 'gold',
  },
};

exports.IRCFilterTypes = {
  BAN: 1,
  TIMEOUT: 2,
  DELETE: 3,
  WARNING: 4,
  REVIEW: 5,
};
