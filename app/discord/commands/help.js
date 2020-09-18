'use strict';

const { Collection } = require('discord.js');
const { usage } = require.main.require('./app/util/helpers');

module.exports = {
  usage: [
    '[command type]',
    'legacy [command] (This lists all commands across all servers in a very ugly code block)'
  ],
  aliases: ['?'],

  run(socket, message, args) {
    const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
    if (args[0] == "legacy") {
      let command = args[1];
      if (command) {
        if (command.charAt(0) === commandPrefix) {
          command = command.substring(1);
        }
      }

      const handler = command ? socket.commands.get(command.toLowerCase()) : null;
      const commands = handler ? new Collection([[command, handler]]) : socket.commands;

      const lines = commands
        .sort((va, vb, ka, kb) => +(ka > kb) || +(ka === kb) - 1)
        .map((item, name) => usage(item.usage, commandPrefix, name))
        .filter((line) => line)
        .join('\n\n');

      if (!lines) return;

      message.channel.send(`\`\`\`${lines}\`\`\``, { split: true }).catch((err) => {
        socket.app.log.out('error', module, err);
      });
    }
    else {
      let request = args[0];

      let msg = socket.getEmbed('help', [commandPrefix]);

      if (!request) {
        request = "none";
      }
      request = request.toLowerCase();
      switch (request) {
        case "prefix":
          msg.addField("About", "This command allows you to change the prefix for the bot server wide.");
          msg.addField("Restrictions", "The prefix for the bot cannot contain `@` or `#` to avoid accidental conflicts with discord mentions.")
          msg.addField("Permissions", "You must have the `Manage Server` permission to change the bot prefix!");
          break;
        case "rm":
        case "rolemanager":
          msg.addField("About", "The role manager is very robust and allows different roles to be assigned and removed in different channels.");
          msg.addField("Aliases", "This command can also be abbreviated to `" + commandPrefix + "rm`.");
          msg.addField("Usage", "`" + commandPrefix + "rolemanager (add|remove) <#channel> <@role> [@role @role etc...] [makeme|makemenot]`\n`" + commandPrefix + "rolemanager remove <#channel> [role]`\n`" + commandPrefix + "rolemanager [list] [#channel]`");
          msg.addField("Argument Types", "Arguments surrounded by `<>` are required arguments.\nArguments surrounded by `[]` are optional arguments.\n Arguments surrounded by `()` are required arguments that only have a few options.\n Arguments separated by `|` are selectable, e.g. `add` **OR** `remove`. Only specify one!");
          msg.addField("Arguments", "`(add|remove)` specifies adding vs. removing a role from a channels role manager.\n`#channel` defines which channel you are updating, it **must** be mentioned!\n`@role` defines which role you are adding/removing, you can add multiple at once and they **must** be mentioned!\n`role` without the `@` is a the exact name of a role you would like to remove, e.g. if the role was deleted.\n`makeme|makemnot` specifies that you are adding or removing a role from only one of the respective commands. e.g. a `member` role that can only be added.\n`list` will give you back a list of the current role manager (this is the default behavior), specifying a channel will list only that channel.");
          msg.addField("Permissions", "You must have the `Manage Roles` permissions to make changes to the role manager!");
          msg.addField("Important!", "The bot __**must**__ have a role that is __**above all**__ the roles that it is assigning! This is a restriction from discord and cannot be avoided.");
          break;
        case "cm":
        case "colormanager":
          msg.addField("About", "The colormanager allows different color roles to be assigned (as well as removing color altogether). It automatically removes all other color roles that have been specified so that the new color is always the displayed color.");
          msg.addField("Aliases", "This command can also be abbreviated to `" + commandPrefix + "cm`.");
          msg.addField("Usage", "`" + commandPrefix + "colormanager (add|remove) <@role> [@role @role etc...]`\n`" + commandPrefix + "colormanager remove [role]`\n`" + commandPrefix + "colormanager channel <#channel>`\n`" + commandPrefix + "colormanager [list]`");
          msg.addField("Argument Types", "Arguments surrounded by `<>` are required arguments\nArguments surrounded by `[]` are optional arguments\n Arguments surrounded by `()` are required arguments that only have a few options\n Arguments separated by `|` are selectable, e.g. `add` **OR** `remove`. Only specify one!");
          msg.addField("Arguments", "`(add|remove)` specifies adding vs. removing a role from the color manager.\n`#channel` defines which channel the color manager operates in, it **must** be mentioned!\n`@role` defines which role you are adding/removing, you can add multiple at once and they **must** be mentioned!\n`role` without the `@` is a the exact name of a role you would like to remove, e.g. if the role was deleted.\n`list` will give you back a list of the current color managemer (this is the default behavior).");
          msg.addField("Permissions", "You must have the `Manage Roles` permissions to make changes to the role manager!");
          msg.addField("Important!", "The bot __**must**__ have a role that is __**above all**__ the roles that it is assigning! This is a restriction from discord and cannot be avoided.");
          msg.addField("Recommendations", "It is highly recommended that color roles sit in between moderator roles and general user roles, that way they will always be the highest role for everyone other than moderators and therefore be the color assigned.")
          break;
        case "moderation":
          msg.addField("About", "There are not a ton of moderation commands at this time, however, the ones provided do have a unique applciation that discord does not give users direct access to.");
          msg.addField("Voice based commands", "`" + commandPrefix + "moveall [channel]` **->** moves all users in your voice channel to a new voice channel (not mentioned).\n\n`" + commandPrefix + "muteall [time]` **->** mutes all users in your voice channel except you and bots for the time specified in seconds, or 15 seconds if no time is specified. To prevent auto-unmute, specify time as `0`.\n\n`" + commandPrefix + "unmuteall` **->** unmutes all users in your voice channel.");
          msg.addField("Text based commands", "`" + commandPrefix + "clear <amount:1-100>` **->** clears the number of messages specified in the channel the command was sent in. Note: discord does not allow bots to delete messages older than 2 weeks at the moment.");
          msg.addField("Permissions", "Each command requires the same permission as if you were manually doing the desired action.");
          msg.addField("Special Note", "The `moveall` command can act differently depending on the bot and user permissions. In order to move people out of a channel, the bot must have the `Move Members` permission. This works as expected, however, if the bot does not have permission to connect to the new voice channel, it will only move members that can connect to the new channel. This can be used to move only mods to a mod only channel, but it could also be undesireable. If the bot has the connect permission in the new channel, everyone will be moved.");
          break;
        case "music":
          msg.addField("About", "While the commands exist for using this bot as a music bot, due to network restraints, they are currently disabled.")
          break;
        case "donate":
          msg.addField("Thank You!", "Thank you for considering donating. Donations of any size are greatly appreciated. If you have any feature requests, you will have priority. You will also get first access when the music commands are being rolled out.");
          msg.addField('\u200b','\u200b');
          msg.addField("Donation Link", "<https://www.paypal.me/corncierge>");
          break;
        case "room":
        case "rooms":
        case "game rooms":
          msg.addField("About", "The rooms feature allows any member of the server to create a room to organize members (Up to 25 total per server) without using the typical role system. ");
          msg.addField("Usage - Room Access", "`" + commandPrefix + "room list [room id|all]` -> gives you the list rooms and their status.\n`" + commandPrefix + "room join <room id>` -> joins the waiting room for the room specified by the id.\n`" + commandPrefix + "room leave [@user|username]` -> leaves the current room, if you are the owner, it will automatically transfer ownership.");
          msg.addField("Usage - Room Management", "`" + commandPrefix + "room create <room name>` -> creates a new room that you own with the specified room name.\n`" + commandPrefix + "room remove [room id] -> removes a room completely.`\n`" + commandPrefix + "room fill [room id]` -> moves users from the waiting room to the players list.")
          msg.addField("Usage - Advanced", "`" + commandPrefix + "room set [room id] (code|players) <option>` -> sets the room code or max number of players for a room.\n`" + commandPrefix + "room clear <room id>` -> clears all players from a room except the owner.\n`" + commandPrefix + "room transfer <@newOwner> [room id]` -> transfers ownership of a room to a new user, you **cannot** reclaim the room after using this!");
          msg.addField("Argument Types", "Arguments surrounded by `<>` are required arguments.\nArguments surrounded by `[]` are optional arguments.\n Arguments surrounded by `()` are required arguments that only have a few options.\n Arguments separated by `|` are selectable, e.g. `code` **OR** `players`. Only specify one!");
          msg.addField("Arguments", "`room id` is generated by the bot and appears in the room list. When it is an **optional** argument, the room id is assumed to be whatever room **you own** unless specified.\n`(code|players)` defines what setting you are updating \n`option` is wahatever you are specifying the new setting to be (if unspecified for the code, it will remove it). When specifying players, it must be a number, up to 35.\n`@user`/`@newOwner` must be a mentioned user and is the desired target for the command action.");
          msg.addField("Permissions", "Anyone can create a room, and they have full control (all commands) over that room. Mods with `Manage Channels`,`Manage Messages`, or `Manage Roles` can execute all commands for any room by specifying the optional room id parameter.");
          msg.addField("Important!", "A user can be in multiple waiting rooms, however, they can only be in one room once they are on the players list. A user will automatically be removed from all waiting lists if they become a player.\n\nIf you are the last person in a room (and by default, the owner) and you use `" + commandPrefix + "room leave`, the room will be removed, even if there are players in the waiting room!");
          break;
        default:
          msg.setDescription("Here is a list of all help categories, to see a list of commands for each category, use `" + commandPrefix + "help <category>`");
          msg.addField("Rolemanager", "The basic format for adding roles to the rolemanager is `" + commandPrefix + "rolemanager add #channel @role`. There are many more detailed options listed in `" + commandPrefix + "help rolemanager`", true);
          msg.addField("Colormanager", "The basic format for color management is `" + commandPrefix + "colormanager channel #channel`, then `" + commandPrefix + "colormanager add @role`. There are many more detailed options listed in `" + commandPrefix + "help colormanager`", true)
          msg.addField('\u200b','\u200b');
          msg.addField("Moderation", "The moderation commands allow you to clear a certain numbers of messages, move members in your voice channel, and toggle everyones mute status, more detail in `" + commandPrefix + "help moderation`", true);
          msg.addField("Prefix", "You are able to change the prefix for all commands", true);
          msg.addField('\u200b','\u200b');
          msg.addField("Rooms", `Rooms give you the flexibility to organize members temporarily, without roles. Use \`${commandPrefix}help room\` to see how to use them.`);
          msg.addField("Music", "Unfortunately, music commands have not been enabled on this server, they are still a WIP.", true);
          msg.addField('\u200b','\u200b');
          msg.addField("Donate", "Thanks for using corncierge, if you would like to donate to support, you can do that here: <https://www.paypal.me/corncierge>. Thank you!", true);
          msg.addField("Invite", "If you want to add this bot to your server, head on over to <https://www.corncierge.com> (or use `" + commandPrefix + "invite`)");
      }
      message.channel.send(msg);
    }
  },
};
