module.exports = {
    pollTwitch(client) {
        const {MessageEmbed, Message} = require("discord.js");
        const fetch = require("node-fetch");
        let Oauthtoken = "8rd5eo37qfz3am3xg7nf1qlozbmy1x"; // Individual Oath Token
        let clientID = "236vnthdxnesa5obcq6mcfbs0kbvh6"; // Individual Client ID
        let userLogin = "snazjdbot";  // Username
        let twitchPing = new Message();

        let options = {method: "GET", headers: {
            'Client-ID': clientID,
            'Authorization': "Bearer " + Oauthtoken 
        }}

        let lastState = "offline";
        
        // Poll Twitch to see if <userLogin> is live
        function poll() {
            fetch("https://api.twitch.tv/helix/streams?user_login=" + userLogin, options).then(res => res.text()).then(function(text) {
                // If <userLogin> is live, log "streaming"
                if (text.indexOf("live") > -1 ) {
                    let streamData = JSON.parse(text);
                    resolveGameIDs(streamData);
                    
                }
                // Else log {"data":[],"pagination":{}}
                else {
                    unpingDiscord();
                }
            });
        }

        function resolveGameIDs(streamData) {
            let game_id = streamData["data"][0]["game_id"];
            fetch("https://api.twitch.tv/helix/games?id=" + game_id, options).then(res => res.text()).then(function(text) {
                gameData = JSON.parse(text);
                pingDiscord(streamData, gameData["data"][0]["name"]);
            });
            
        }

        function pingDiscord(streamData, game_name) {
            

            if (lastState === "offline") {
                 console.log("Live");
                 let destination_channel = client.channels.cache.find(channel => channel.name === "stream");
                 let user_name = streamData["data"][0]["user_name"];
                 let game_id = streamData["data"][0]["game_id"];
                 let title = streamData["data"][0]["title"];
                 let created_at = streamData["data"][0]["started_at"];
                 let thumbnail_url = "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + userLogin + "-1280x720.jpg";
                 let title_url = "https://www.twitch.tv/" + userLogin;
                 let profile_picture = "https://static-cdn.jtvnw.net/jtv_user_pictures/4b07d2c8-58e9-4e88-85a4-2b377ea1542f-profile_image-300x300.png";

                 let fakeMsg = new Message();
                 fakeMsg.channel = destination_channel;
                 role = fakeMsg.guild.roles.cache.find(roles => roles.name === "Twitch");

                 let alert_text = `${role} ` + userLogin + ` is now live at ` + title_url + ` he*kin go there!`;

                 const twitchEmbed = new MessageEmbed();
                 twitchEmbed.title = title;
                 twitchEmbed.color = 0xecbeef;
                 twitchEmbed.author = {name: user_name, url: title_url};
                 twitchEmbed.url = title_url;
                 twitchEmbed.thumbnail = {url: profile_picture};
                 twitchEmbed.fields = [
                     {name: "Catagory", value: game_name, inline: true}
                    ];
                 twitchEmbed.image = {url: thumbnail_url};
                 twitchEmbed.timestamp = created_at;
                 twitchEmbed.type = "rich";

                 twitchPing.content = alert_text;
                 twitchPing.channel = destination_channel;
                
                twitchPing.channel.send(twitchPing, twitchEmbed);

            }

            lastState = "live";
        }

        function unpingDiscord() {
            
            if( lastState === "live") {
                twitchPing.channel.lastMessage.delete();
            }
            lastState = 'offline';
        }
        
        //Poll Twitch every 10 secons
        setInterval(poll, 10000);
    }
};
