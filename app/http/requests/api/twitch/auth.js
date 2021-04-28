'use strict';

const BaseRequest = require('../../BaseRequest');

class TwitchAuthRequest extends BaseRequest {
  constructor(socket) {
    const info = {
      name: 'auth',
      methods: 'GET',
      description: 'handles recieving auth data from twitch',
      responds: true,
    };
    super(socket, info);
  }

  async run(method, uri) {
    const url = new URL(uri, 'https://localhost');
    const code = url.searchParams.get('code');
    if (!code) return { statusCode: 400, data: 'Missing URL Parameter: code' };
    await this.socket.app.twitch.auth.generateToken(code);
    return { statusCode: 302, headers: { location: '/success?type=twitchtoken' } };
  }
}

module.exports = TwitchAuthRequest;
