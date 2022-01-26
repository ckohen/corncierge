'use strict';

module.exports = {
  // "Root" classes
  TwitchAuthClient: require('./client/AuthClient'),
  TwitchBaseClient: require('./client/BaseClient'),
  TwitchClient: require('./client/Client'),

  // Utilities
  TwitchAPIError: require('./rest/TwitchAPIError'),
  TwitchConstants: require('./util/Constants'),
  TwitchHTTPError: require('./rest/HTTPError'),
  TwitchUtil: require('./util/Util'),

  // Managers
  TwitchBaseManager: require('./managers/BaseManager'),
  TwitchCachedManager: require('./managers/CachedManager'),
  TwitchCategoryManager: require('./managers/CategoryManager'),
  TwitchChannelManager: require('./managers/ChannelManager'),
  TwitchDataManager: require('./managers/DataManager'),
  TwitchStreamManager: require('./managers/StreamManager'),
  TwitchStreamTagManager: require('./managers/StreamTagManager'),
  TwitchTagManager: require('./managers/TagManager'),
  TwitchTeamManager: require('./managers/TeamManager'),
  TwitchUserManager: require('./managers/UserManager'),

  // Structures
  TwitchBase: require('./structures/Base'),
  TwitchCategory: require('./structures/Category'),
  TwitchChannel: require('./structures/Channel'),
  TwitchChannelEditor: require('./structures/ChannelEditor'),
  TwitchFollow: require('./structures/Follow'),
  TwitchStream: require('./structures/Stream'),
  TwitchSubscription: require('./structures/Subscription'),
  TwitchTag: require('./structures/Tag'),
  TwitchTeam: require('./structures/Team'),
  TwitchUser: require('./structures/User'),
};
