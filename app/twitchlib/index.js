'use strict';

// Utilities
exports.TwitchUtil = require('./util/Util');

// Managers
exports.TwitchBaseManager = require('./managers/BaseManager');
exports.TwitchCachedManager = require('./managers/CachedManager');
exports.TwitchCategoryManager = require('./managers/CategoryManager');
exports.TwitchChannelManager = require('./managers/ChannelManager');
exports.TwitchDataManager = require('./managers/DataManager');
exports.TwitchStreamManager = require('./managers/StreamManager');
exports.TwitchStreamTagManager = require('./managers/StreamTagManager');
exports.TwitchTagManager = require('./managers/TagManager');
exports.TwitchTeamManager = require('./managers/TeamManager');
exports.TwitchUserManager = require('./managers/UserManager');

// Structures
exports.TwitchBase = require('./structures/Base');
exports.TwitchCategory = require('./structures/Category');
exports.TwitchChannel = require('./structures/Channel');
exports.TwitchChannelEditor = require('./structures/ChannelEditor');
exports.TwitchFollow = require('./structures/Follow');
exports.TwitchStream = require('./structures/Stream');
exports.TwitchSubscription = require('./structures/Subscription');
exports.TwitchTag = require('./structures/Tag');
exports.TwitchTeam = require('./structures/Team');
exports.TwitchUser = require('./structures/User');
