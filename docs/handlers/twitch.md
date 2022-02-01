# Built-in twitch command handlers

Corncierge comes with a few built-in command responders that should be useful to most bots.
It is your choice whether to use these responders depending on the method column in the database.

For twitch commands, if the responder fails in any way or takes to long, it will respond with the output in the database.

## Utility Commands

- `followage`: returns how long the caller or specified user has been following the channel, if they are not following this falls back to the database response
- `variable`: allows creating, editing, and deleteing custom variables

## Other Commands

- `joke`: says a random joke from the database

## Setting up built-in commands

There are two ways to use these (and custom created) functions in your twitch command.

1. Modify the database directly and set the `method` column for the command to one of the above names.
2. Use `!commands link commandname uptime` to link the command to the function in discord.

## Automatic replacement variables

There are 5 basic variables and several variables that request data from twitch available in command responses and are automatically replaced. All variables are identified by wrapping them in `{}`.
E.g. `{caster}` will be replaced with the broadcasters name.

#### Built-in replacements:

- `{user}` - the user that executed the command
- `{touser}` - the first parameter passed to the command, or the user that executed the command if there is no first parameter
  - `{touser-defaultuser}` is a special form of touser that is the same as above but if there is no first parameter it uses the specified defaultuser instead
- `{count}` - the number of times the command has been called
- `{caster}` - the broadcaster in the channel the command was executed in
- `{query}` - the full query string that the user entered
  - `{query-default query}` is a special form of query that is the same as above but replaces an empty query with the default query

#### Twitch replacements:

These replacements all use the same format and contain some extra configuration parameters for specifying which user / channel / stream to fetch data for.
The format is as follows: `{twitch.<type>.<property> [user] [defaultUser]}`

In this format the type will be one of `user`, `channel`, or `stream` depending on the property you want to replace, see the more detailed list below. Having this deliniation helps inform people modifying commmands how privileged some of the fetched information is and why it may not sometimes be available.

Both `[user]` and `[defaultUser]` are completely optional and support a special bit of syntax sugar:

- `[user]` can be amy twitch name, `(touser)`, `(user)`, or `(caster)`, the latter of which are replaced with their normal replacements, exception being touser, which does not default if there was no query
- `[defaultUser]` can be any twitch name, `(user)`, or `(caster)`, the latter of which are replaced with their normal replacements.

If no user and defaultUser are specified, the data fetched will be for the broadcaster. If the value of user evaluates to be empty, the data fetched will be for the broadcaster (by default) or whatever is specified in defaultUser, this currently only applies to `(touser)`

An example:

- `{twitch.channel.title}` is replaced with the broadcaster's title
- `{twitch.channel.title corncierge}` is replaced with corncierge's title
- `{twitch.channel.title (touser)}` run with e.g. `!title corncierge` is replaced with corncierge's title
- `{twitch.channel.title (touser)}` run with e.g. `!title` is replaced with the broadcaster's title
- `{twitch.channel.title (touser) (user)}` run with e.g. `!title` is replaced with the user who ran the command's title

##### Full list of twitch replacements

- `{twitch.user.followerCount}` - replaced with the queried users follower count
- `{twitch.user.createdAt}` - replaced with a formatted string of the date (and how long ago) the queried user was created at
- `{twitch.user.displayName}` - replaced with the queried users display name
- `{twitch.channel.title}` - replaced with the queried channels title
- `{twitch.channel.category}` - replaced with the queried channels category
- `{twitch.channel.subscriberCount}` - replaced with the queried channels unique subscriber count, **requires authorization to work**, recommended only to use for the broadcaster
- `{twitch.channel.subscriptionPoints}` - replaced with the queried channels total subscription points, **requires authorization to work**, recommended only to use for the broadcaster
- `{twitch.stream.startedAt}` - replaced with a formatted string of the date (and how long ago) the queried stream was started, **only works when the queried stream is live**
- `{twitch.stream.uptime}` - replaced with a formatted string of how long the queried stream has been running, **only works when the queried stream is live**
- `{twitch.stream.tags}` - replaced with a list of tags that are set on the queried stream

#### Custom variables (up to 25 per channel):

- `{var-<somevarname>}` - replaced with a custom value set via discord or irc
