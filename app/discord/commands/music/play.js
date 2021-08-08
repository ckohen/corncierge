'use strict';

const discordYoutube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
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

    if (!message.guild.me.voice.channel) {
      musicData.isPlaying = false;
      musicData.nowPlaying = null;
      musicData.songDispatcher = null;
      if (!voiceChannel.joinable) {
        message.channel.send(`${message.member}, I cannot access that voice channel!`);
        return;
      }
    }

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
      let waitNotify = await message.channel.send('Adding playlist to queue, this may take a bit!');
      for (let i = 0; i < videosObj.length; i++) {
        if (videosObj[i].raw.status.privacyStatus === 'private') {
          continue;
        } else {
          try {
            /* eslint-disable-next-line no-await-in-loop */
            const video = await videosObj[i].fetch();
            /*
            // This can be uncommented if you choose to limit the queue
            if (musicData.queue.length < 10) {
            */
            musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user));
            /*
            } else {
              return message.reply(`I can't play the full playlist because there will be more than 10 songs in queue`);
            }
            */
          } catch (err) {
            this.socket.app.log.warn(module, err);
          }
        }
      }
      waitNotify.delete();
      if (musicData.isPlaying === false) {
        playSong(musicData.queue, message, this.socket);
        return;
      } else if (musicData.isPlaying === true) {
        message.channel.send(`Playlist - :musical_note:  ${playlist.title} :musical_note: has been added to queue`);
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      query = query.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_-]/i)[0];
      const video = await youtube.getVideoByID(id).catch(() => message.channel.send(`${message.member}, There was a problem getting the video you provided!`));
      /*
      // Can be uncommented if you don't want the bot to play live streams
      if (video.raw.snippet.liveBroadcastContent === 'live') {
        message.channel.send(`${message.member}, I don't support live streams!`);
        return;
      }
      // Can be uncommented if you don't want the bot to play videos longer than 1 hour
      if (video.duration.hours !== 0) {
        message.channel.send(`${message.member}, I cannot play videos longer than 1 hour`);
        return;
      }
      // Can be uncommented if you want to limit the queue
      if (message.guild.musicData.queue.length > 10) {
        message.channel.send(`${message.member}, There are too many songs in the queue already, skip or wait a bit`);
        return;
      }
      */
      musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user));
      if (musicData.isPlaying === false || typeof musicData.isPlaying === 'undefined') {
        musicData.isPlaying = true;
        playSong(musicData.queue, message, this.socket);
        return;
      } else if (musicData.isPlaying === true) {
        message.channel.send(`${video.title} added to queue`);
        return;
      }
    }

    // If user provided a song/video name
    const videos = await youtube.searchVideos(query, 5).catch(async () => {
      await message.channel.send(`${message.member}, There was a problem searching the video you requested :(`);
    });
    if (videos.length < 5 || !videos) {
      message.channel.send(`${message.member}, I had some trouble finding what you were looking for, please try again or be more specific`);
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}: ${videos[i].title}`);
    }
    vidNameArr.push('exit');
    var songSearch = this.socket.getEmbed('songSearch', [vidNameArr]);
    var songEmbed = await message.channel.send({ embeds: [songSearch] });
    message.channel
      .awaitMessages({ filter: msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit', max: 1, time: 60000, errors: ['time'] })
      .then(response => {
        const videoIndex = parseInt(response.first().content);
        if (response.first().content === 'exit') {
          songEmbed.delete();
          return;
        }
        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(video => {
            /*
            // Can be uncommented if you don't want the bot to play live streams
            if (video.raw.snippet.liveBroadcastContent === 'live') {
              songEmbed.delete();
              return message.channel.send("I don't support live streams!");
            }

            // Can be uncommented if you don't want the bot to play videos longer than 1 hour
            if (video.duration.hours !== 0) {
              songEmbed.delete();
              return message.channel.send(`${message.member}, I cannot play videos longer than 1 hour`);
            }

            // Can be uncommented if you don't want to limit the queue
            if (message.guild.musicData.queue.length > 10) {
              songEmbed.delete();
              return message.channel.send(`${message.member}, There are too many songs in the queue already, skip or wait a bit`);
            }
            */
            musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user));
            if (musicData.isPlaying === false) {
              musicData.isPlaying = true;
              if (songEmbed) {
                songEmbed.delete();
              }
              playSong(musicData.queue, message, this.socket);
            } else if (musicData.isPlaying === true) {
              if (songEmbed) {
                songEmbed.delete();
              }
              message.channel.send(`${video.title} added to queue`);
            }
          })
          .catch(() => {
            if (songEmbed) {
              songEmbed.delete();
            }
            return message.channel.send(`${message.member}, An error has occured when trying to get the video ID from youtube`);
          });
      })
      .catch(() => {
        if (songEmbed) {
          songEmbed.delete();
        }
        return message.channel.send(`${message.member}, Please try again and enter a number between 1 and 5 or exit`);
      });
  }
}

function playSong(queue, message, socket) {
  const musicData = socket.cache.musicData.get(String(message.guildId));
  queue[0].voiceChannel
    .join()
    .then(connection => {
      const dispatcher = connection
        .play(
          ytdl(queue[0].url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10,
          }),
        )
        .on('start', () => {
          musicData.songDispatcher = dispatcher;
          dispatcher.setVolume(musicData.volume);
          dispatcher.setBitrate(192);
          const videoEmbed = socket.getEmbed('play', [queue]);
          if (queue[1]) videoEmbed.addField('Next Song:', queue[1].title);
          // Comment out to disable auto notify on next song
          message.channel.send({ embeds: [videoEmbed] });
          musicData.nowPlaying = queue[0];
          return queue.shift();
        })
        .on('finish', () => {
          if (queue.length >= 1) {
            return playSong(queue, message, socket);
          } else {
            musicData.isPlaying = false;
            musicData.nowPlaying = null;
            musicData.songDispatcher = null;
            if (message.guild.me.voice.channel) {
              return message.guild.me.voice.channel.leave();
            }
            return false;
          }
        })
        .on('error', e => {
          message.reply({ content: `Cannot play song \`${queue[0].title}\`, skipping`, allowedMentions: { repliedUser: true } });
          socket.app.log.warn(module, e);
          if (queue.length > 1) {
            queue.shift();
            return playSong(queue, message, socket);
          } else {
            musicData.isPlaying = false;
            musicData.nowPlaying = null;
            musicData.songDispatcher = null;
            return message.guild.me.voice.channel?.leave();
          }
        });
    })
    .catch(e => {
      socket.app.log.warn(module, e);
      return message.guild.me.voice.channel?.leave();
    });
}

function constructSongObj(video, voiceChannel, user) {
  let duration = formatDuration(video.duration);
  if (duration === '00:00') duration = 'Live Stream';
  return {
    url: `https://www.youtube.com/watch?v=${video.raw.id}`,
    title: video.title,
    rawDuration: video.duration,
    duration,
    thumbnail: video.thumbnails.high.url,
    voiceChannel,
    memberDisplayName: user.username,
    memberAvatar: user.displayAvatarURL(),
  };
}

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? `${durationObj.hours}:` : ''}${durationObj.minutes ? durationObj.minutes : '00'}:${
    durationObj.seconds < 10 ? `0${durationObj.seconds}` : durationObj.seconds ? durationObj.seconds : '00'
  }`;
  return duration;
}

module.exports = PlayCommand;
