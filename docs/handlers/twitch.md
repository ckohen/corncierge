# Built-in twitch command handlers

Corncierge comes with a few built-in command responders that should be useful to most bots.
It is your choice whether to use these responders depending on the method column in the database.

For twitch commands, if the responder fails in any way or takes to long, it will respond with the output in the database.

## Utility Commands

* `followage`: returns how long the caller or specified user has been following the channel, if they are not following this falls back to the database response
* `uptime`: returns how long the stream has been up for

## Other Commands

* `joke`: says a random joke from the database
