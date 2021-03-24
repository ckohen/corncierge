'use strict';

module.exports = async (socket, request, response) => {
  // Ignore aborted requests
  if (request.aborted) {
    return response.end();
  }

  // Handle deprecated requests
  if (request.url === '/') {
    let method;
    if (request.headers.stream) {
      if (request.headers.stream === 'Started') {
        method = '/streaming/streamstart';
      }
      if (request.headers.stream === 'Stopped') {
        method = '/streaming/streamstop';
      }
    }
    if (method) {
      socket.requests.get(method.toLowerCase()).run(socket, request.method, request.url, request.headers);
      response.statusCode = 202;
      return response.end();
    }
    socket.app.log.verbose(module, `Attempt to access base page`);
    response.statusCode = 404;
    return response.end();
  }

  let handler = socket.requests.get(request.url.toLowerCase());

  // Check if accessing a subpage or with queries
  if (!handler) {
    socket.requests.forEach((req, key) => {
      if (request.url.toLowerCase().startsWith(key)) {
        handler = req;
      }
    });
  }

  // Check for a handler
  if (!handler) {
    socket.app.log.verbose(module, `Attempt to access unhandled page: ${request.url}`);
    response.statusCode = 404;
    return response.end();
  }

  // Check method restrictions
  if (request.method !== 'GET' && request.method !== 'HEAD' && !handler.methods.includes(request.method)) {
    response.statusCode = 405;
    return response.end();
  }

  // Handle internal vs external response
  try {
    if (!handler.responds) {
      await handler.run(socket, request.method, request.url, request.headers);
      response.statusCode = 202;
    } else {
      const res = await handler.run(socket, request.method, request.url, request.headers);
      if (res) {
        response.writeHead(res.statusCode, res.headers);
        if (res.data && request.method !== 'HEAD') {
          response.write(Buffer.from(res.data));
        }
      }
    }
  } catch (err) {
    socket.app.log.warn(module, `Error occured during request call ${handler.name}: ${err.stack ? err.stack : err}`);
    response.statusCode = 503;
    response.write('Error Encountered by server while processing request!');
  }
  return response.end();
};
