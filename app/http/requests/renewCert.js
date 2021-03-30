'use strict';

const BaseRequest = require('./BaseRequest');

class RenewCertRequest extends BaseRequest {
  constructor(socket) {
    const info = {
      name: 'renewcert',
      methods: 'PUT',
      description: 'Handles renewing the certificate when using https',
    };
    super(socket, info);
  }

  run(method, url, headers) {
    if (!this.socket.options.useHttps) return Promise.reject(new Error('Attempt to reboot http for certificate while not running https'));
    if (method.toLowerCase() !== 'put') return Promise.reject(new Error('Attempt to GET certificate renewal'));
    if (headers['user-agent'] !== 'CertBot Deploy Hook 0.0.1') return Promise.reject(new Error('Wrong user agent when attempting certificate renewal'));
    if (headers.token !== this.socket.app.settings.get('rebootToken')) return Promise.reject(new Error('Invalid token when attempting to reboot https'));
    this.socket.app.rebootHttps();
    return Promise.resolve(true);
  }
}

module.exports = RenewCertRequest;
