'use strict';

module.exports = async (socket, request, response) => {
  // Handle incoming data
  let data = '';
  request.on('data', chunk => (data += chunk));
  await new Promise(res => request.on('end', res));
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
      socket.requests.get(method.toLowerCase()).run(request.method, request.url, request.headers, data.toString());
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

  const constantHeaders = { 'Access-Control-Allow-Methods': handler.methods.join(', ') };

  // Check method restrictions
  if (!handler.methods.includes(request.method)) {
    response.writeHead(405, { 'Access-Control-Allow-Methods': handler.methods.join(', ') });
    return response.end();
  }

  // Handle internal vs external response
  try {
    if (!handler.responds) {
      await handler.run(request.method, request.url, request.headers, data);
      response.writeHead(204, constantHeaders);
    } else {
      const res = await handler.run(request.method, request.url, request.headers, data);
      if (res) {
        response.writeHead(res.statusCode, Object.assign(constantHeaders, res.headers));
        if (res.data && request.method !== 'HEAD') {
          response.write(Buffer.from(res.data));
        }
      } else {
        response.writeHead(204, constantHeaders);
      }
    }
  } catch (err) {
    socket.app.log.warn(module, `Error occured during request call ${handler.name}`, err);
    response.statusCode = 503;
    response.write('Error Encountered by server while processing request!');
  }
  return response.end();
};
