## About

The database is a critical piece of infrastructure needed for bots that run on this module. This module uses an SQL database, namely MySQL or MariaDB, which can be used interchangeably. The database will store some user data, so make sure access to it is well protected and follow any local guidelines for user generated content.

## Getting Ready

First, you will need to install [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) on whatever server you will be using. This can also be offloaded to another server as caching is being used to ensure quick access.

After installing the database, you will need to configure it with the required tables as well as any additional tables for the built in commands you will be using. These are listed below. All tables use the utf8 charset with a utf8_bin collation.

<info>A `*` in the colum name column indicates the primary key for the table. A `*` in the datatype column indicates Not Null.</info>

## Required Tables

#### Settings

The `settings` table contains critical information for runtime, it uses a key value pair:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| name*       | VARCHAR(255)* |         |
| value       | VARCHAR(255)  | ''      |

This table will need to have a few keys populated. Some of these keys will not need to be populated if that part of the app is not used. Here are the names of the keys and what they need to store:

- `discord_activity` - the activity to display, can be set during runtime via command
- `discord_activity_type` - the type of activity to display, can be set during runtime via command
- `discord_channel_commandManagement` - until multiple twitch channels are supported better, a comma separated list of channel ids where twitch commands can be managed
- `discord_channel_console` - a comma separated list of channel ids where most management commands can be run
- `discord_channel_music` - a comma separated list of channel ids where music commands can be used
- `discord_guild_management` - a comma separated list of guild ids where the rest of the management commands can be used
- `discord_user_owner` - a comma separated list of user ids that can run owner only commands
- `irc_message_cheer` - until multiple twitch channels are supported better, the message sent when someone cheers in a twitch chat
- `irc_message_resub` - until multiple twitch channels are supported better, the message sent when someone resubscribes in a twitch chat
- `irc_message_stream_down` - until multiple twitch channels are supported better, the message sent when the streamer stops streaming
- `irc_message_stream_up` - until multiple twitch channels are supported better, the message sent when the stream starts streaming
- `irc_message_sub` - until multiple twitch channels are supported better, the message sent when someone subscribes in a twitch chat

#### Streaming

The `streaming` table contains information for handling different streamers notifications, here is its structure:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| name*       | VARCHAR(255)* |         |
| channel     | VARCHAR(50)   | NULL    |
| role        | VARCHAR(50)   | NULL    |
| lastMessage | VARCHAR(50)   | NULL    |

## Additional Tables

### Tables for Discord Commands / Operations

#### Color Manager

The `colormanager` table houses data for the `!colormanager`, `!color`, and `/color` commands:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| roles       | LONGTEXT      | NULL    |
| snowflakes  | LONGTEXT      | NULL    |

#### New Member Roles

The `newmemberrole` table houses data for the `!autorole` command and the automatic assignment or roles on member join:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| roleId      | VARCHAR(50)   | NULL    |
| delayTime   | VARCHAR(8)    | '0'     |

#### Prefixes

The `prefixes` table houses data for the `!prefix` command and the prefix used for all commands on a guild:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| prefix      | VARCHAR(50)*  | '!'     |

#### Random Channels

The `randomchannels` table houses data for the `!randommove` command:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| toChannel   | VARCHAR(50)*  | ''      |
| fromChannel | VARCHAR(50)*  | ''      |

#### Reaction Roles

The `reactionroles` table houses data for the `!reacionroles` command and the operation of reaction roles:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| channelId   | VARCHAR(50)   | NULL    |
| messageId   | VARCHAR(50)   | NULL    |
| roles       | LONGTEXT      | NULL    |

#### Role Manager

The `rolemanager` table houses data for the `!rolemanager`, `!makeme`, and `!makemenot` commands:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| addRoles    | LONGTEXT      | NULL    |
| removeRoles | LONGTEXT      | NULL    |

#### Rooms

The `rooms` table houses data for the `!room` and `/room` commands:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| data        | LONGTEXT      | NULL    |

#### Voice Roles

The `voiceroles` table houses data for the `!voiceroles` command and provides operational data to assign the roles when receiving voice state updates:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| data        | LONGTEXT      | NULL    |

#### Volumes

The `volumes` table houses data for the volume of music on each guild:

| Column Name | Datatype      | Default |
| ----------- | ------------- | ------- |
| guildId*    | VARCHAR(50)*  |         |
| volume      | VARCHAR(50)   | '1'     |

### Tables for Twitch Commands / Operations

#### Commands

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `commands` table houses data for the runtime commands for IRC and their associated management commands in discord:

| Column Name | Datatype           | Default    |
| ----------- | ------------------ | ---------- |
| id*         | INT(10)* (UN) (AI) |            |
| input       | VARCHAR(255)*      |            |
| mention     | TINYINT(3)* (UN)   | 0          |
| method      | VARCHAR(255)       | NULL       |
| output      | VARCHAR(300)       | NULL       |
| locked      | TINYINT(3)* (UN)   | 0          |
| count       | BIGINT(20)* (UN)   | 0          |
| restriction | VARCHAR(45)        | 'everyone' |
| created_at  | TIMESTAMP          | NULL       |
| updated_at  | TIMESTAMP          | NULL       |
| deleted_at  | TIMESTAMP          | NULL       |

#### Filters

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `filters` table houses data for the runtime moderation for IRC:

| Column Name | Datatype           | Default |
| ----------- | ------------------ | ------- |
| id*         | INT(10)* (UN) (AI) |         |
| type        | TINYINT(3)* (UN)   |         |
| input       | VARCHAR(255)*      | ''      |
| duration    | INT(10) (UN)       | NULL    |
| output      | VARCHAR(500)       | NULL    |
| created_at  | TIMESTAMP          | NULL    |
| updated_at  | TIMESTAMP          | NULL    |
| deleted_at  | TIMESTAMP          | NULL    |

#### IRC Variables

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `ircvariables` table houses data for the runtime replacement of variables in command responses for IRC and their associated methods in discord:

| Column Name | Datatype           | Default |
| ----------- | ------------------ | ------- |
| id*         | INT(10)* (UN) (AI) |         |
| name        | VARCHAR(32)*       |         |
| value       | VARCHAR(255)       | NULL    |
| channel     | VARCH(50)*         |         |

#### Jokes

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `jokes` table houses data for the joke responses for IRC:

| Column Name | Datatype           | Default |
| ----------- | ------------------ | ------- |
| id*         | INT(10)* (UN) (AI) |         |
| output      | VARCHAR(500)*      | NULL    |
| created_at  | TIMESTAMP          | NULL    |
| updated_at  | TIMESTAMP          | NULL    |
| deleted_at  | TIMESTAMP          | NULL    |

#### Bot Log

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `log_bot` table houses the log for bot moderated messages on IRC:

| Column Name | Datatype           | Default |
| ----------- | ------------------ | ------- |
| id*         | INT(10)* (UN) (AI) |         |
| filter_id   | INT(10)* (UN)      |         |
| action      | VARCHAR(255)*      |         |
| user        | VARCHAR(255)*      |         |
| user_id     | INT(10)* (UN)      |         |
| duration    | INT(10) (UN)       | NULL    |
| message     | TEXT*              |         |
| created_at  | TIMESTAMP          | NULL    |

<info>The `filter_id` column of this table can have a foreign key added to the `filters` table</info>

#### Human Log

<warn>This table is changing soon to be able to better accommodate multiple twitch channels.</warn>

The `log_human` table houses the log for human moderated messages on IRC:

| Column Name  | Datatype           | Default |
| ------------ | ------------------ | ------- |
| id*          | INT(10)* (UN) (AI) |         |
| action       | VARCHAR(255)*      |         |
| user         | VARCHAR(255)*      |         |
| user_id      | INT(10)* (UN)      |         |
| moderator    | VARCHAR(255)*      |         |
| moderator_id | INT(10)* (UN)      |         |
| duration     | INT(10) (UN)       | NULL    |
| reason       | VARCHAR(500)       | NULL    |
| message      | TEXT               | NULL    |
| created_at   | TIMESTAMP          | NULL    |
| updated_at   | TIMESTAMP          | NULL    |

#### Authorization

The `twitchauth` table houses the tokens used to interact with the twitch API on behalf of users:

| Column Name  | Datatype      | Default |
| ------------ | ------------- | ------- |
| id*          | INT(10)* (UN) |         |
| accessToken  | VARCHAR(35)   | NULL    |
| refreshToken | VARCHAR(55)   | NULL    |
| scopes       | LONGTEXT      | NULL    |

## Adding Tables

You can add as many tables to the database as you woud like. There are a few ways to access these tables via the module.

- Direct queries to the database
- Your own abstraction of the direct query
- The abstraction of queries provided by the module

### Direct queries to the database

You can make direct queries to the database using `<app>.database.query()`. This makes a direct query to the database via `mysql2`. Using `?` in the query string lets you replace via javascript from the second parameter, which is an array.
Another way to use javascript in your queries is via template literals `` `INSERT INTO `table` (guildId) VALUES (${guild.id})` ``
Both are equally useful and it is up to you which to use.

### The abstraction of queries provided by the module

The module provides an interface so you only have to write the queries once and can utilize it throughout the app.

There are three steps to do this:

1. Create a table class that extends `BaseTable`. Name it what you would like to identify it by, as this name will be used everywhere. <warn>You cannot use the reserved names `socket` or `register`.</warn>
2. Write whatever methods you would like to use in this class. The queries can be made via `this.socket.query()` and a utility `this.parseJSON()` is available to parse stringified JSON that was stored. The method names on the internal tables are `get`, `add`, `delete`, and `edit`, representing what they do to the database.
3. Register the table via `<app>.database.tables.register(table)`.

The table is now accessible via `app.database.tables.[tableName]`
