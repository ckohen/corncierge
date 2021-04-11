# Built-in twitch command handlers

Corncierge comes with a few built-in command responders that should be useful to most bots.
It is your choice whether to use these responders depending on the method column in the database.

For twitch commands, if the responder fails in any way or takes to long, it will respond with the output in the database.

## Utility Commands

* `followage`: returns how long the caller or specified user has been following the channel, if they are not following this falls back to the database response
* `uptime`: returns how long the stream has been up for
* `variable`: allows creating, editing, and deleteing custom variables

## Other Commands

* `joke`: says a random joke from the database

## Setting up built-in commands

There are two ways to use these (and custom created) functions in your twitch command.

1. Modify the database directly and set the `method` column for the command to one of the above names.
2. Use `!commands link commandname uptime` to link the command to the function in discord.

## Automatic replacement variables

There are 4 variables in command responses that are automatically replaced. These variables are identified by wrapping them in `{}`.
E.g. `{caster}` will be replaced with the broadcasters name.

Built-in replacements:
* `{user}` - the user that executed the command
* `{touser}` - the first parameter passed to the command, or the user that executed the command if there is no first parameter
* `{count}` - the number of times the command has been called
* `{caster}` - the broadcaster in the channel the command was executed in

Custom variables (up to 25 per channel):
* `{var-<somevarname>}` - replaced with a custom value set via discord or irc