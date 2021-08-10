<div align="center">
<h1 style="font-size: 100px; margin-bottom: 0px; color: #5865F2; font-weight: 700">Corncierge</h1>
<p>
    <a href="https://discord.gg/vNEXNYt"><img src="https://img.shields.io/discord/756319910191300778?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://github.com/ckohen/corncierge/actions"><img src="https://github.com/ckohen/corncierge/workflows/Testing/badge.svg" alt="Build status" /></a>
  </p>
</div>

## About

Corncierge is a [Node.js](https://nodejs.org) module that combines several powerful components.

Interacting with Discord is [discord.js](https://discord.js.org). This module provides an abstraction layer for handling commands (both conventional message and interactions) and moderation type events on top of the already existing coverage discord.js provides.

Interacting with Twitch is a custom implementation of the API via [Axios](https://axios-http.com/) (including authorization) and IRC for chat via [tmi.js](https://tmijs.com/). Similarly to discord, the module provides an abstraction layer for handling commands sent in chat and handling moderation.

There are two additional components that are completely for arbitrary purposes, HTTP and Logging. HTTP is used internally for sending streaming status updates and as the redirect url for twitch authorization. It uses a custom abstraction layer on top of [Nodes built in HTTP(s)](https://nodejs.org/api/http.html) API. Logging, done via [Winston](https://github.com/winstonjs/winston), is a typical console log for the internal workings of the module, and logs to a discord webhook for critical events. There are application options to configure both of these.

The final piece of the module is the database connection. The application relies on a mysql / mariadb database and connects to it via [mysql2](https://github.com/sidorares/node-mysql2#readme). This allows you to build in additional database queries should you need, but provides an abstraction layer for interacting with the base required databases.

**Node.js 16.6.0 or newer is required.**


## Links

- [Website](http://bot.corncierge.com/) ([source](https://github.com/discordjs/website), based on top of discordjs)
- [Documentation](https://bot.corncierge.com/#/docs/corncierge/main/general/welcome)
- [Corncierge Discord server](https://discord.gg/vNEXNYt)
- [GitHub](https://github.com/ckohen/corncierge)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](https://bot.corncierge.com/#/docs/corncierge/main/general/welcome). Feel free to submit a PR at any time!


## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Corncierge Help Desk](https://discord.gg/vNEXNYt).