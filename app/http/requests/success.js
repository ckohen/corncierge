'use strict';

const BaseRequest = require('./BaseRequest');

class SuccessRequest extends BaseRequest {
  constructor(socket) {
    const info = {
      name: 'success',
      methods: 'GET',
      description: 'A generic succes page',
      responds: true,
    };
    super(socket, info);
  }

  run(method, uri) {
    const url = new URL(uri, 'https://localhost');
    const type = url.searchParams.get('type');
    return { statusCode: 200, headers: { 'Success-Type': type }, data: 'Success!' };
  }
}

module.exports = SuccessRequest;
