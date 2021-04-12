# Built-in discord commands

Corncierge comes with a lot of built-in commands that should be useful to most bots.
Any and all of these commands can be disabled via [ApplicationOptions.discord](/#/docs/corncierge/master/typedef/DiscordOptions):

```js
// Disable the music commands and the random number command
new Application({ discord: { disabledCommands: ['music', 'random'] }});
```

## Traditional Commands

These commands are message based commands that will be supported until slash commands are fully fleshed out and support proper gating of usage. All of these commands are prefixed by the prefix for the guild, the default is `!`, and can be changed using the `prefix` command.

### Gaming

* `random`: generates a random number between 0 and the specified number
* `room`: an orginizational system for members with waiting rooms and player lists
  * this command is quite complex and is better described in the client by the slash command equivalent

### General

* `help`: A help command that handles help information for most built-in commands
  * you may want to override this with your own help command to add your own commands
  * `help legacy` will list your custom commands as well however

### Management

These are commands that essentially act as the console for the bot, most are locked to the `console` channel.

* `eval`: runs the code specified using eval, the nodejs util and the discord.js client are imported for use, locked to the `owner` user
* `reboot`: cleanly reboots the bot
* `reload`: reloads the cache, i.e. everything in the database
* `setstatus`: sets the bots discord status, at this time it cannot be fully custom
* `status`: sends a message with the current status of the bot
* `update`: executes `git pull` and then `npm install` on the command line to update the bot, automatically restarts to apply changes, locked to the `owner` user

### Moderation

All of the commands in this category require the same permission as if you were to perform the actions manually

* `clear`: clears the last n lines as specified, cannot delete messages that are older than 2 weeks
* `moveall`: moves all users in a voice channel to another voice channel, can specify both starting and ending channel
  * `moveall general` moves everyone in your current voice channel or `moveall general -> general2`
* `muteall`: mutes everyone in the current voice channel aside for the caller and bots, automatically unmutes after the specified time (15 seconds by default)
* `prefix`: changes the prefix in the current guild to whatever is specified
* `randommove`: randomly moves the number of people specified using the same syntax as `moveall`
* `unmuteall`: unmutes everyone in the current voice channel, useful after `muteall 0`

### Music

Most of these commands should be familiar from other music bots. The commands marked with `DJ` require a role named `DJ` to use unless you have `MANAGE_ROLES`.

* `leave`: makes the bot leave the current channel `DJ`
* `loop`: loops the currently playing song the number of times specified `DJ`
* `nowplaying`: displays the currently playing song
* `pause`: pauses the currently playing song
* `play`: starts or adds to the queue of songs, can only play youtube!
* `queue`: displays the current queue
* `remove`: removes the song number specified from the queue `DJ`
* `resume`: resumes the currently playing song after using `pause`
* `shuffle`: shuffles the current queue `DJ`
* `skip`: skips the current playing song `DJ`
* `skipall`: clears the current queue, does NOT skip the current playing song `DJ`
* `skipto`: skips the queue to the spot in the queue specified `DJ`
* `volume`: sets the volume to the value specified `DJ`

### Roles

There are lots of different ways to manage roles, the default commands allow you a couple different methods. To use any of the managers, you need to have `MANAGE_ROLES`.

* `autorole`: set up a role to automatically be assigned to new members, can be after a specified wait period `manager`
* `color`: assings the caller a color (role) if it has been set up in the colormanager, functionality is better using slash commands
* `colormanager`: sets up roles and channel for the `color` command `manager`
* `makeme`: assigns the caller any role based on the name if it has been set up in rolemanager
* `makemenot`: removes any role from the caller based on the name if it has been set up in rolemanager
* `reactionroles`: sets up role assignment via reactions `manager`
* `rolemanager`: sets up a database of roles and channels that each role can be self assigned in `manager`
* `voiceroles`: sets up up to 5 sets of channels that each have a unique voice role associated `manager`

### Twitch

These commands are for interfacing with the built in twitch IRC bot. Locked to a command management channel.

* `commandlist`: lists all the currently registerd twitch commands
* `commands`: allows creating, editing, and removing twitch commands
* `variables`: allows creating, editing, and removing custom twitch replaceable variables

## Slash Commands

These commands are mostly self explanatory as they display the information in the client. However, you do need to take some extra steps to tell discord about these commands. These commands are not disabled by the `disabledCommands` parameter since they have to be manually registered.

* `/color`: assigns a color that was set up in color manager
* `/room`: an orginizational system for members with waiting rooms and player lists

### Registering Slash Commands

Because of the unique nature of slash commands, they can be registered per guild or globally. Corncierge provides some helper methods to register commands for you. This is best done using the `eval` command.

```js
// Adding all registered slash commands (yes including custom ones), globally
// Commands with guilds specified will not be registered globally
!eval socket.registerCommands();

// Adding all registered slash commands, to a specific guild
// Checks to see if the commands are registered globally first
// Commands with guilds specified that are not this guild will not get registered to it
!eval socket.registerCommands(':guildid');

// Adding a single registered slash command, by name
// The command will be registered globally if guilds is not specified in the command data
// If guilds is specified in the registration info, it will register to every guild listed
!eval socket.registerCommand('commandname');
```

`socket` in the above code refers to the [DiscordManager](/#/docs/corncierge/master/class/DiscordManager). You can find more information about these methods there. It can be accessed as `Application#discord`.