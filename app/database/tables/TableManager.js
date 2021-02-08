'use strict';

const BaseTable = require('./BaseTable');

/**
 * Stores the tables for a database
 */
class TableManager {
  constructor(socket) {
    /**
     * The database manager that handles these tables
     * @name TableManager#socket
     * @type {DatabaseManager}
     * @private
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * Stores the registered table associated with TableName
     * @name TableManager#[TableName]
     * @type {BaseTable}
     */

    /**
     * An array of database tables, all of which deal with discord, are mapped by guildID, and are cached normally
     * @type {BaseTable[]}
     */
    this.discord = [];

    this.register(require('./botLog'));
    this.register(require('./colorManager'), 'discord');
    this.register(require('./humanLog'));
    this.register(require('./ircCommands'));
    this.register(require('./ircFilters'));
    this.register(require('./jokes'));
    this.register(require('./newMemberRole'), 'discord');
    this.register(require('./prefixes'), 'discord');
    this.register(require('./randomChannels'), 'discord');
    this.register(require('./reactionRoles'), 'discord');
    this.register(require('./roleManager'), 'discord');
    this.register(require('./rooms'));
    this.register(require('./settings'));
    this.register(require('./streaming'));
    this.register(require('./voiceRoles'), 'discord');
    this.register(require('./volumes'));
  }

  /**
   * Registers a table in the manager for use throughout the application
   * @param {BaseTable} table the table to register
   * @param {string} [type] the type of this table, used to place in relevant arrays
   */
  register(table, type = undefined) {
    const name = table.name.replace(/Table$/, '');
    const handler = new table(this.socket);
    if (!(handler instanceof BaseTable)) throw new TypeError(`Database tables must extend BaseTable: ${table.name}`);
    this[name] = handler;
    switch (type) {
      case 'discord':
        this.discord.push(this[name]);
        break;
    }
  }
}

module.exports = TableManager;
