/* TWITCH BOT */
var tmi = require("tmi.js");
var channelName = "snazjd";
var twitchPrefix = "!";

var config = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "snazjdBot",
		password: "oauth:69k0z4x33uesz0w1egfg6ycqr659u7"
	},
	channels: [channelName]
}

var twitchClient = new tmi.client(config)

twitchClient.connect();

twitchClient.on("chat", (channel, user, message, self) => {
	if (self) return;


	//cmd handler code
	const args = message.slice(twitchPrefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();

	try {
		let commandFile = require(`./commands/${cmd}.js`)
		commandFile.run(twitchClient, message, args, user, channel, self)
	} catch (err) {
		return;
	}
})

/* DISCORD BOT */
const twitchAPI = require('./twitchAPI');
const fs = require('fs');
const Discord = require('discord.js');
const options = require('./options');

const app = require('./application');
moderationApp = new app(options);
moderationApp.boot(); 

const { discordPrefix, token } = require('./config.json');

const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	discordClient.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

discordClient.once('ready', () => {
	console.log('Ready!');

	twitchAPI.pollTwitch(discordClient);
});

// Check each message to see if it's a command
discordClient.on('message', message => {
	if (!message.content.startsWith(discordPrefix) || message.author.bot) return;

	const args = message.content.slice(discordPrefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = discordClient.commands.get(commandName)
		|| discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// If message is not a command do nothing
	if (!command) return;

	// If message is sent in DMs notify user
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	// If command requires args and doesn't have any notify user
	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		//if the command has "usage:" at beginning give proper notation
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${discordPrefix}${command.name} ${command.usage}\``;
		}

		message.channel.send(reply);
		// deletes command and resopne messages after 3 seconds
		setTimeout(function () { message.channel.bulkDelete(2); }, 5000);
		return;

	}

	try {
		command.execute(message, args); // If command gets handled 
	} catch (error) {
		console.error(error); // Log  error
		message.reply('there was an error trying to execute that command!'); // Notify user
	}

});

discordClient.login(token);