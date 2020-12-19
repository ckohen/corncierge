const { Collection } = require("discord.js");

module.exports = {
    name: 'room',
    description: 'Allows servers to have game rooms with waiting rooms',
    usage: [
        'list [room id]',
        'join <room id>',
        'leave [@user|username]',
        'create <room name>',
        'set [room id] (code|players) <option>',
        'remove [room id]',
        'clear <room id>',
        'fill [room id]',
        'transfer <@newOwner> [room id]'
    ],

    async run(socket, interaction, args) {
        const method = args[0].name;
        args = args[0].options;

        // A list of key value pairs with room ids and their associated room
        let rooms = socket.rooms.get(String(interaction.guild.id));

        if (typeof rooms == 'undefined' || rooms == null) {
            socket.rooms.set(String(interaction.guild.id), new Collection());
            rooms = socket.rooms.get(String(interaction.guild.id));
        }

        // Get the master room or create it
        let masterRoom = rooms.get("master");
        if (!masterRoom) {
            rooms.set("master", { id: "master", name: null, owner: null, playerCount: 10, code: null, players: [], waiting: [], lastChannelID: null, lastMessageID: null });
            masterRoom = rooms.get("master");
        }


        let acknowledged = false;
        let room = false;
        const roomID = args?.find(arg => arg.name === `roomID`)?.value;
        let member;
        let inRoom;

        switch (method) {
            case 'create':
                // Only allow each server to have 25 rooms
                if (rooms.size > 25) {
                    return interaction.reply(`There are already 25 rooms in this server, please wait for another room to close!`, { hideSource: true, ephemeral: true });
                }

                // Don't let a user own more than one room
                let existing = rooms.find(room => room.owner == String(interaction.member.id))
                if (existing) {
                    interaction.reply(`You already own a room: **ID**: ${existing.id}, **Name**: ${existing.name}. Please delete it to create a new room!`, { hideSource: true, ephemeral: true });
                    room = existing;
                    acknowledged = true;
                    break;
                }

                // Find the earliest available id
                for (i = 1; i < 26; i++) {
                    if (!rooms.has(String(i))) {
                        // Create the new room
                        rooms.set(String(i), { id: String(i), name: args.find(arg => arg.name === `name`).value.substring(0, 30), owner: String(interaction.member.id), playerCount: 10, code: null, players: [String(interaction.member.id)], waiting: [], lastChannelID: null, lastMessageID: null});
                        socket.app.database.add('rooms', [interaction.guild.id + '-' + String(i)]);
                        room = rooms.get(String(i));
                        break;
                    }
                }

                rooms.each(index => {
                    if (index.waiting.includes(String(interaction.member.id))) {
                        index.waiting.splice(index.waiting.indexOf(String(interaction.member.id)), 1);
                    }
                });
                break;
            case 'set':
                const submethod = args[0].name;
                args = args[0].options;
                // Check if the requested room exists
                if (args?.find(arg => arg.name === `roomID`)?.value) {
                    let requested = args.find(arg => arg.name === `roomID`).value;
                    room = rooms.get(String(requested));
                    if (typeof room == 'undefined' || rooms == null) {
                        room = false;
                        interaction.reply(`There is no room with room id ${requested}!`, { hideSource: true, ephemeral: true });
                        acknowledged = true;
                        break;
                    }
                }
                else {
                    room = rooms.find(room => room.players.includes(String(interaction.member.id)));
                    if ((typeof room == 'undefined' || rooms == null)) {
                        room = false;
                        interaction.reply(`You must be in a room to use that command!`, { hideSource: true, ephemeral: true });
                        acknowledged = true;
                        break;
                    }
                }
                // Check permissions
                if (String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can manage it!`, { hideSource: true, ephemeral: true });
                }
                // Set each option accordingly
                switch (submethod) {
                    case "code":
                        const newCode = args.find(arg => arg.name === `code`).value;
                        if (typeof newCode == 'undefined' || newCode == `~`) {
                            room.code = null;
                        }
                        else {
                            room.code = newCode;
                        }
                        break;
                    case "players":
                        const newMax = args.find(arg => arg.name === `max`).value;
                        // Allow up to 35 players in a room
                        if (0 < newMax < 36) {
                            room.playerCount = newMax;
                        }
                        else {
                            return interaction.reply(`The player count must be a number between 1 and 35!`, { hideSource: true, ephemeral: true });
                        }
                        break;
                }
                break;
            case "remove":
                // Check if the room exists

                room = rooms.get(String(roomID));
                if (typeof room == 'undefined' || rooms == null) {
                    let msg = `There is no room with room id ${roomID}!`;
                    room = roomID ? false : rooms.find(room => room.players.includes(String(interaction.member.id)));
                    if (!roomID && (typeof room == 'undefined' || rooms == null)) {
                        room = false;
                        msg = `You must be in a room to use that command!`;
                    }
                    if (!room) {
                        interaction.reply(msg, { hideSource: true, ephemeral: true });
                        acknowledged = true;
                        break;
                    }
                }
                // Check permissions
                if (String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can remove it!`, { hideSource: true, ephemeral: true });
                }
                // Delete the room
                interaction.reply(`Room ${room.id}: **${room.name}** has been successfully removed, the new list of rooms can be found below.`, { ephemeral: true });
                socket.app.database.delete('rooms', [interaction.guild.id + '-' + room.id]);
                rooms.delete(room.id);
                room = false;
                acknowledged = true;
                break;
            case "join":
                // Check if the room exists
                room = rooms.get(String(roomID));
                if (typeof room == 'undefined' || rooms == null) {
                    room = false;
                    interaction.reply(`There is no room with room id ${roomID}!`, { hideSource: true, ephemeral: true });
                    acknowledged = true;
                    break;
                }
                // Check if the user is already in a room
                inRoom = rooms.find(room => room.players.includes(interaction.member.id));
                if (typeof inRoom == 'undefined' || inRoom == null) {
                    if (!room.waiting.includes(interaction.member.id)) { 
                        room.waiting.push(String(interaction.member.id));
                    }
                }
                else {
                    return interaction.reply(`You cannot join a room while playing in another room! Use \`/room leave\` to leave your current room.`, { hideSource: true, ephemeral: true })
                }
                break;
            case "leave":
                // Mentioned user or user
                member = interaction.member.id;
                const forcedUser = args?.find(arg => arg.name === `user`)?.value; 
                if (forcedUser) {
                    member = forcedUser;
                }
                
                // Find the room and determine whether they are a player or waiting
                let playing = true;
                room = rooms.find(room => room.players.includes(member));
                if (typeof room == 'undefined' || room == null) {
                    playing = false;
                    room = rooms.find(room => room.waiting.includes(member));
                    if (typeof room == 'undefined' || room == null) {
                        room = false;
                        return interaction.reply(`That member is not currently in a room!`, { hideSource: true, ephemeral: true });
                    }
                }
                // Check Permissions for forced leave
                if (forcedUser && String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can force users to leave!`, { hideSource: true, ephemeral: true });
                }
                // Transfer ownership to next player in list
                if (member == room.owner) {
                    if (room.players.length > 1) {
                        room.owner = room.players[1];
                        let newOwner = interaction.guild.members.cache.get(room.owner);
                        interaction.reply(`The owner has left, the new owner is ${newOwner}`)
                        room.players.shift();
                        acknowledged = true;
                    }
                    // Delete the room if there is no new possible owner
                    else {
                        socket.app.database.delete('rooms', [interaction.guild.id + '-' + room.id]);
                        rooms.delete(room.id);
                        return interaction.reply(`You were the last player in ${room.name}, it has been deleted.`, { ephemeral: true });
                    }
                }
                else {
                    if (playing) {
                        room.players.splice(room.players.indexOf(member), 1);
                    }
                    else {
                        rooms.each(index => {
                            if (index.waiting.includes(member)) {
                                index.waiting.splice(index.waiting.indexOf(member), 1);
                            }
                        });
                    }
                }
                break;
            case "clear":
                // Check if the room exists
                room = rooms.get(String(roomID));
                if (typeof room == 'undefined' || room == null) {
                    room = false;
                    interaction.reply(`There is no room with room id ${roomID}!`, { hideSource: true, ephemeral: true });
                    acknowledged = true
                    break;
                }
                // Check Permissions
                if (String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can manage it!`, { hideSource: true, ephemeral: true });
                }
                // Clear the room except for the owner
                room.players.splice(1);
                break;
            case "fill":
                // Check if the room exists
                room = rooms.get(String(roomID));
                if (typeof room == 'undefined' || room == null) {
                    let msg = `There is no room with room id ${roomID}!`;
                    room = roomID ? false : rooms.find(room => room.players.indexOf(String(interaction.member.id)) > -1);
                    if (!roomID && (typeof room == 'undefined' || room == null)) {
                        room = false;
                        msg = `You must be in a room to use that command!`;
                    }
                    if (!room) {
                        interaction.reply(msg, { hideSource: true, ephemeral: true });
                        acknowledged = true;
                        break;
                    }
                }
                // Check Permissions
                if (String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can manage it!`, { hideSource: true, ephemeral: true });
                }

                // Move members to fill up to player cap
                for (i = 0; i < room.playerCount; i++) {
                    if (!room.players[i] && room.waiting[0]) {
                        let newPlayer = room.waiting.shift();
                        room.players.push(newPlayer);
                        // Remove member from all other waiting rooms
                        rooms.each(index => {
                            if (index.waiting.includes(newPlayer)) {
                                index.waiting.splice(index.waiting.indexOf(newPlayer), 1);
                            }
                        });
                    }
                }
                break;
            case "transfer":
                // Check if the member exists
                member = args?.find(arg => arg.name === `newOwner`).value;

                // Check if the room exists
                room = rooms.get(String(roomID));
                if (typeof room == 'undefined' || room == null) {
                    let msg = `There is no room with room id ${roomID}!`;
                    room = roomID ? false : rooms.find(room => room.players.indexOf(String(interaction.member.id))) > -1;
                    if (!roomID && (typeof room == 'undefined' || room == null)) {
                        room = false;
                        msg = `You must be in a room to use that command!`;
                    }
                    if (!room) {
                        interaction.reply(msg, { hideSource: true, ephemeral: true });
                        acknowledged = true;
                        break;
                    }
                }
                // Check Permissions
                if (String(interaction.member.id) != room.owner && !interaction.member.permissions.any(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS", "MANAGE_ROLES"])) {
                    return interaction.reply(`Only the owner of a room and admins/mods can transfer ownership!`, { hideSource: true, ephemeral: true });
                }
                // Check if the new user is in the room
                if (!room.players.includes(member)) {
                    return interaction.reply(`The new owner must be a player in the room!`, { hideSource: true, ephemeral: true });
                }
                room.players.splice(room.players.indexOf(member), 1);
                room.owner = member;
                room.players.unshift(member);
                break;
            case 'list':
                // Check if user is in a room
                inRoom = rooms.find(room => room.players.indexOf(interaction.member.id) > -1);
                if (inRoom) {
                    room = inRoom;
                }
                // Check if user specified a specific room
                if (roomID) {
                    if (roomID === 0) {
                        room = false;
                    }
                    else {
                        room = rooms.get(roomID);
                    }
                }
                if (!room) {
                    room = false;
                }
            default:
                ;
        }

        if (!acknowledged) interaction.acknowledge();

        // Create base embed
        let msg = socket.getEmbed('rooms', [interaction.member, '/']);
        if (rooms.size < 2) {
            // Delete old master room information if it exists
            if (masterRoom && masterRoom.lastChannelID && masterRoom.lastMessageID) {
                let lastMasterMessageChannel = await socket.driver.channels.cache.get(masterRoom.lastChannelID);
                if (lastMasterMessageChannel) {
                    lastMasterMessageChannel.messages.fetch(masterRoom.lastMessageID).then(msg => {msg.delete()}).catch();
                }
            }
            return interaction.channel.send("**No rooms have been created yet**", msg).then(sentMsg => {
                if (masterRoom) {
                    masterRoom.lastChannelID = sentMsg.channel.id;
                    masterRoom.lastMessageID = sentMsg.id;
                }
            });
        }

        // Count lines so we don't hit the charachter limit!
        let lines = 0;
        let owner;
        if (room) {
            // Delete old room information if it exists
            if (room.lastChannelID && room.lastMessageID) {
                let lastMessageChannel = await socket.driver.channels.cache.get(room.lastChannelID);
                if (lastMessageChannel) {
                    lastMessageChannel.messages.fetch(room.lastMessageID).then(msg => {msg.delete()}).catch();
                }
            }
            // Store discord's copy of the owner
            owner = interaction.guild.members.cache.get(room.owner);
            // Change the default description to be more acdurate for a single room
            msg.setDescription(`Join this room by typing \`/room join ${room.id}\`. See a list of all rooms by typing \`/room list all\``);
            // Add Room name and code (if applicable)
            if (room.code) {
                msg.addField(`Room Name`, `${room.name} \n**Current code**: \`${room.code}\``);
            }
            else {
                msg.addField("Room Name", `${room.name}`)
            }
            // Create the list of users in the room
            let playing = [];
            room.players.forEach(player => playing.push(`<@!${player}>`));
            let waiting = [];
            room.waiting.forEach(player => waiting.push(`<@!${player}>`));
            let len = waiting.length;
            if (waiting.length < 1) {
                len = 0;
                waiting.push("No players waiting!");
            }
            if (waiting.length > 35) {
                waiting.splice(34);
                let extra = room.waiting.length - waiting.length;
                waiting.push(`...and ${extra} more members`);
            }
            // Add lists to the embed
            msg.addField(`Players (${playing.length}/${room.playerCount})`, playing.join("\n"), true);
            msg.addField(`Waiting Room (${len})`, waiting.join("\n"), true);
            // Change footer from default to room owner
            msg.setFooter(`Room Owner: ${owner?.user.username}`, owner.user.displayAvatarURL());
        }
        else {
            // Delete old master room information if it exists
            if (masterRoom && masterRoom.lastChannelID && masterRoom.lastMessageID) {
                let lastMasterMessageChannel = await socket.driver.channels.cache.get(masterRoom.lastChannelID);
                if (lastMasterMessageChannel) {
                    lastMasterMessageChannel.messages.fetch(masterRoom.lastMessageID).then(msg => {msg.delete()}).catch();
                }
            }
            // Create arrays for each embed
            let set1 = [];
            let set2 = [];
            let set3 = [];
            let fields = 1;
            // Loop through room list and add to arrays
            rooms.filter(room => room.id !== "master").each(room => {
                lines += 1;
                owner = interaction.guild.members.cache.get(room.owner);
                if (lines < 11) {
                    set1.push(`**ID**: ${room.id}, **Name**: ${room.name}\nOwned by ${owner.user.username}, Playing: ${room.players.length}/${room.playerCount}, Waiting: ${room.waiting.length}`)
                }
                else if (lines < 21) {
                    set2.push(`**ID**: ${room.id}, **Name**: ${room.name}\nOwned by ${owner.user.username}, Playing: ${room.players.length}/${room.playerCount}, Waiting: ${room.waiting.length}`)
                }
                else {
                    set3.push(`**ID**: ${room.id}, **Name**: ${room.name}\nOwned by ${owner.user.username}, Playing: ${room.players.length}/${room.playerCount}, Waiting: ${room.waiting.length}`)
                }
            });

            // Edit the embed
            if (set2.length > 0) {
                fields = 2;
            }
            if (set3.length > 0) {
                fields = 3;
            }
            switch (fields) {
                case 1:
                    msg.addField(`Rooms`, set1.join("\n"));
                    break;
                case 2:
                    msg.addField(`Rooms (1/${fields})`, set1.join("\n"));
                    msg.addField(`Rooms (2/${fields})`, set2.join("\n"));
                    break;
                case 3:
                    msg.addField(`Rooms (1/${fields})`, set1.join("\n"));
                    msg.addField(`Rooms (2/${fields})`, set2.join("\n"));
                    msg.addField(`Rooms (3/${fields})`, set3.join("\n"));
                    break;
                default:
            }
        }
        let lastMessage = await interaction.channel.send(msg);
        if (room) {
            // Store last message information
            room.lastChannelID = lastMessage.channel.id;
            room.lastMessageID = lastMessage.id;
            // Update database
            socket.app.database.edit('rooms', [interaction.guild.id + '-' + room.id, room]);
        }
        else {
            // Store last message information
            if (masterRoom) {
                masterRoom.lastChannelID = lastMessage.channel.id;
                masterRoom.lastMessageID = lastMessage.id;
            }
        }
    },
};