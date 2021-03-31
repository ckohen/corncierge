'use strict';

/**
 * A way to add http request handlers to the bot
 */

// Import the necessary elements
const { Application, BaseRequest } = require('corncierge');

// Create an instance of the application, make sure to provide actual config options or this will fail
const app = new Application();

// Create the structure of your request handler
class HelloWorldRequest extends BaseRequest {
  constructor(socket) {
    // Define the parameters of the command
    const requestDescriptor = {
      name: 'helloworld',
      methods: ['GET'],
      description: 'a simple webpage that displays Hello World',
      responds: true,
    };
    super(socket, requestDescriptor);
  }

  // The function that is called when the webpage (/helloworld in this case) is called
  // There is a 4th parameter which contains the data set with the request if any, for POST, PUT, etc...
  run(method, url, headers) {
    // Use this.socket if you need to talk to the HTTPManager
    this.socket.app.log(module, `Hellow world page served from request with headers: ${headers}`);
    return {
      // You determine your own status code, and it must be set
      statusCode: 200,
      // This data is sent to Buffer.from()
      data: '<h1>Hello World!</h1>',
    };
  }
}

// Let the app know about your command responder
// This is accessible at http://domain.com/helloworld
app.http.requestsManager.register(HelloWorldRequest);

// Change the path before /helloworld
// This is accessible at http://domain.com/examples/helloworld
app.http.requestsManager.register(HelloWorldRequest, '/examples/');

// Register multiple request handlers at once to a path
// This is accessible at http://domain.com/examples/basic/helloworld
// Note there are no slashes before and after the group name
app.http.requestsManager.registerGroup([HelloWorldRequest], 'examples/basic');

// If you register two request handlers with the same path (or register the same handler twice) it overwrites the existing one
// The same request handlers with different paths will not overwrite!

// Start the app
app.boot();
