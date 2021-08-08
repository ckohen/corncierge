'use strict';

const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const discordYoutube = require('simple-youtube-api');
const queueHandler = require('./queueHandler');
const queueItem = require('./queueItem');
const BaseCommand = require('../BaseCommand');

class PlayCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'play',
      aliases: ['play-song', 'add'],
      description: 'Play any song or playlist from youtube',
      usage: ['<song name>', '<song url>', '<playlist url>'],
      channel: 'music',
      permissions: ['SPEAK', 'CONNECT'],
      args: true,
    };
    super(socket, info);
  }

  async run(message, args) {
    let query = args.join(' ');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    const musicData = this.socket.cache.musicData.get(String(message.guildId));

    if (!musicData) {
      message.channel.send('Music is not enabled for this server at this time!');
      return;
    }

    if (!message.guild.me.voice.channel) {
      musicData.subscription = null;
      if (!voiceChannel.joinable) {
        message.channel.send(`${message.member}, I cannot access that voice channel!`);
        return;
      }
    }

    if (!musicData.subscription || musicData.subscription.voiceConnection.status === VoiceConnectionStatus.Destroyed) {
      musicData.subscription = new queueHandler(
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        }),
      );
      musicData.subscription.voiceConnection.on('error', err => this.socket.app.log.warn(module, 'Error during music playback', err));
      musicData.subscription.volume = musicData.volume;
      musicData.subscription.destroyingIn = setTimeout(() => {
        musicData.subscription.voiceConnection.destroy();
        musicData.subscription = null;
      }, 2 * 60 * 1000);
    }

    try {
      await entersState(musicData.subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (err) {
      this.socket.app.log.warn(module, 'Error connecting to voice channel', err);
      message.channel.send('Could not connect to voice, please try again later!');
      return;
    }

    const callbackMethods = {
      onStart(resource) {
        const embed = this.socket.getEmbed('play', [resource.metadata]);
        if (musicData.subscription.length) {
          embed.addField('Next Song:', musicData.subscription.queue[0].title);
        }
        message.channel.send({ embeds: [embed] });
      },
      // eslint-disable-next-line no-empty-function
      onFinish() {},
      onError(err) {
        message.reply(`Cannot play song, skipping`, { allowedMentions: { repliedUser: true } });
        this.socket.app.log.debug(module, 'Error playing song', err);
      },
    };

    const youtube = new discordYoutube(this.socket.app.options.youtube.token);

    if (
      // If the user entered a youtube playlist url
      query.match(/^(?!.*\?.*\bv=)https:\/\/(www\.)?youtube\.com\/.*\?.*\blist=.*$/)
    ) {
      const playlist = await youtube
        .getPlaylist(query)
        .catch(() => message.channel.send(`${message.member}, Playlist is either private or it does not exist!'`));
      // Add 10 as an argument in getVideos() if you choose to limit the queue
      const videosObj = await playlist
        .getVideos()
        .catch(() => message.channel.send(`${message.member}, There was a problem getting one of the videos in the playlist!`));
      for (let i = 0; i < videosObj.length; i++) {
        if (videosObj[i].raw.status.privacyStatus === 'private') {
          continue;
        } else {
          try {
            /* eslint-disable-next-line no-await-in-loop */
            const video = await videosObj[i].fetch();
            const track = queueItem.from(video, message.member.user, callbackMethods);
            musicData.subscription.enqueue(track);
          } catch (err) {
            this.socket.app.log.debug(module, err);
          }
        }
      }
      message.reply(`Playlist - :musical_note:  ${playlist.title} :musical_note: has been added to queue`);
      return;
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      query = query.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_-]/i)[0];
      const video = await youtube.getVideoByID(id).catch(() => message.channel.send(`${message.member}, There was a problem getting the video you provided!`));
      if (!video) return;
      const track = queueItem.from(video, message.member.user, callbackMethods);
      let playingNow = true;
      if (musicData.subscription.isPlaying === true) {
        playingNow = false;
      }
      musicData.subscription.enqueue(track);
      if (!playingNow) {
        message.channel.send(`${video.title} added to queue`);
      }
      return;
    }

    // If user provided a song/video name
    const videos = await youtube.searchVideos(query, 5).catch(async () => {
      await message.channel.send(`${message.member}, There was a problem searching the video you requested :(`);
    });
    if (!videos) return;
    if (videos.length < 5) {
      message.channel.send(`${message.member}, I had some trouble finding what you were looking for, please try again or be more specific`);
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}: ${videos[i].title}`);
    }
    vidNameArr.push('exit');
    const songSearch = this.socket.getEmbed('songSearch', [vidNameArr]);
    const songEmbed = await message.channel.send({ embeds: [songSearch] });
    const responses = await message.channel
      .awaitMessages({
        filter: msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .catch(() => {
        if (songEmbed.deletable) {
          songEmbed.delete();
        }
        return message.channel.send(`${message.member}, Please try again and enter a number between 1 and 5 or exit`);
      });
    if (!responses) return;
    const videoIndex = parseInt(responses.first().content);
    if (responses.first().content === 'exit') {
      if (songEmbed.deletable) {
        songEmbed.delete();
      }
      return;
    }
    const video = await youtube.getVideoByID(videos[videoIndex - 1].id).catch(() => {
      if (songEmbed.deletable) {
        songEmbed.delete();
      }
      return message.channel.send(`${message.member}, An error has occured when trying to get the video ID from youtube`);
    });
    if (!video) return;
    const track = queueItem.from(video, message.member.user, callbackMethods);
    let playingNow = true;
    if (musicData.subscription.isPlaying === true) {
      playingNow = false;
    }
    musicData.subscription.enqueue(track);
    if (songEmbed.deletable) {
      songEmbed.delete();
    }
    if (!playingNow) {
      message.channel.send(`${video.title} added to queue`);
    }
  }
}

module.exports = PlayCommand;
