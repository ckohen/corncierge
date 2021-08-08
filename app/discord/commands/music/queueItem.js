'use strict';

const { createAudioResource, StreamType } = require('@discordjs/voice');
const { FFmpeg } = require('prism-media');
const ytdl = require('ytdl-core');

// eslint-disable-next-line no-empty-function
const noop = () => {};

const FFMPEG_OPUS_ARGUMENTS = ['-analyzeduration', '0', '-loglevel', '0', '-acodec', 'libopus', '-f', 'opus', '-ar', '48000', '-ac', '2'];

class Track {
  constructor({ url, title, rawDuration, duration, thumbnail, memberDisplayName, memberAvatar, onStart, onFinish, onError }) {
    this.url = url;
    this.title = title;
    this.rawDuration = rawDuration;
    this.duration = duration;
    this.thumbnail = thumbnail;
    this.memberDisplayName = memberDisplayName;
    this.memberAvatar = memberAvatar;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  /**
   * Creates an AudioResource from this Track.
   */
  async createAudioResource() {
    const info = await ytdl.getInfo(this.url);
    const audioOnly = info.formats
      .filter(format => format.mimeType === 'audio/webm; codecs="opus"' && format.audioSampleRate === '48000')
      .sort((a, b) => a.averageBitrate > b.averageBitrate);
    const stream = new FFmpeg({
      args: [
        '-reconnect',
        '1',
        '-reconnect_streamed',
        '1',
        '-reconnect_on_http_error',
        '4xx,5xx',
        '-reconnect_delay_max',
        '30',
        '-i',
        audioOnly[0].url,
        ...FFMPEG_OPUS_ARGUMENTS,
      ],
      shell: false,
    });
    return createAudioResource(stream, { metadata: this, inputType: StreamType.OggOpus, inlineVolume: true });
  }

  /**
   * Creates a Track from a set of video data and lifecycle callback methods.
   * @param {Object} data The data fetched for the video
   * @param {User} user The user that added the track
   * @param {Object} methods Lifecycle callbacks
   * @returns {Track} The created Track
   */
  static from(data, user, methods) {
    // The methods are wrapped so that we can ensure that they are only called once.
    const wrappedMethods = {
      onStart(resource) {
        wrappedMethods.onStart = noop;
        methods.onStart(resource);
      },
      onFinish(resource) {
        wrappedMethods.onFinish = noop;
        methods.onFinish(resource);
      },
      onError(error) {
        wrappedMethods.onError = noop;
        methods.onError(error);
      },
    };

    let duration = formatDuration(data.duration);
    if (duration === '00:00') duration = 'Live Stream';

    return new Track({
      title: data.title,
      url: `https://www.youtube.com/watch?v=${data.raw.id}`,
      rawDuration: data.duration,
      duration,
      thumbnail: data.thumbnails.high.url,
      memberDisplayName: user.username,
      memberAvatar: user.displayAvatarURL(),
      ...wrappedMethods,
    });
  }
}

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? `${durationObj.hours}:` : ''}${durationObj.minutes ? durationObj.minutes : '00'}:${
    durationObj.seconds < 10 ? `0${durationObj.seconds}` : durationObj.seconds ? durationObj.seconds : '00'
  }`;
  return duration;
}

module.exports = Track;
