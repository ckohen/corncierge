'use strict';

const BaseCommand = require('../BaseCommand');

class NowPlayingCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      description: 'Display the currently playing song',
      channel: 'music',
    };
    super(socket, info);
  }

  run(message) {
    let musicData = this.socket.cache.musicData.get(String(message.guild.id));
    if (!musicData.isPlaying && !musicData.nowPlaying) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    const video = musicData.nowPlaying;
    let description;
    if (video.duration === 'Live Stream') {
      description = 'Live Stream';
    } else {
      description = playbackBar(musicData, video);
    }

    const videoEmbed = this.socket.getEmbed('videoEmbed', [video, description]);

    message.channel.send({ embeds: [videoEmbed] });
  }
}

function playbackBar(data, video) {
  const passedTimeInMS = data.songDispatcher.streamTime - data.songDispatcher.pausedTime;
  const passedTimeInMSObj = {
    seconds: Math.floor((passedTimeInMS / 1000) % 60),
    minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
    hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24),
  };
  const passedTimeFormatted = formatDuration(passedTimeInMSObj);

  const totalDurationObj = video.rawDuration;
  const totalDurationFormatted = formatDuration(totalDurationObj);

  let totalDurationInMS = 0;
  Object.keys(totalDurationObj).forEach(key => {
    if (key === 'hours') {
      totalDurationInMS += totalDurationObj[key] * 3600000;
    } else if (key === 'minutes') {
      totalDurationInMS += totalDurationObj[key] * 60000;
    } else if (key === 'seconds') {
      totalDurationInMS += totalDurationObj[key] * 100;
    }
  });
  const playBackBarLocation = Math.round((passedTimeInMS / totalDurationInMS) * 10);
  let playBack = '';
  for (let i = 1; i < 21; i++) {
    if (playBackBarLocation === 0) {
      playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
      break;
    } else if (playBackBarLocation === 10) {
      playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
      break;
    } else if (i === playBackBarLocation * 2) {
      playBack += ':musical_note:';
    } else {
      playBack += '▬';
    }
  }
  playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
  return playBack;
}

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? `${durationObj.hours}:` : ''}${durationObj.minutes ? durationObj.minutes : '00'}:${
    durationObj.seconds < 10 ? `0${durationObj.seconds}` : durationObj.seconds ? durationObj.seconds : '00'
  }`;
  return duration;
}

module.exports = NowPlayingCommand;
