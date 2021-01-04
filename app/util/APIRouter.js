'use strict';

const noop = () => {}; // eslint-disable-line no-empty-function
const methods = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors = ['toString', 'valueOf', 'inspect', 'constructor', Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')];

/**
 * An HTTP fetch method, one of:
 * * get
 * * patch
 * * post
 * * put
 * * delete
 * @typedef {string} HTTPMethod
 */

/**
 * @classdesc Not a real class, a proxy for api routes.
 * @class
 * @name Requester
 */

/**
 * A part of the url path, ending with one of {@link HTTPMethod}
 * @name Requester#[param]
 * @type {Requester|Function}
 * @readonly
 * @static
 */

/**
 * Data passed to any request
 * @typedef {Object} RequestData
 * @param {Object} [params] parameters to put in the url
 * @param {Object} [data] for put, post, delete, and patch, the data to pass
 * @param {string} [responseType=json] the expected response type
 * @param {Object} [headers] the headers to send with the response CAUTION: this *can* overide default headers
 */

/**
 * The method to use in the fetch request, see {@link HTTPMethod}
 * @function Requester#HTTPMethod
 * @param {RequestData} data the data to pass to the request
 * @returns {Promise<Object>}
 */

/**
 * A variable part of the url path
 * @function Requester#*
 * @param {string} routeKey the key to add to the url, any number of these is accepted
 */

function buildRoute(manager) {
  const route = [''];
  const handler = {
    get(target, name) {
      if (reflectors.includes(name)) return () => route.join('/');
      if (methods.includes(name)) {
        return data =>
          manager.driver.request({
            method: name,
            url: `${route.join('/')}`,
            ...data,
          });
      }
      route.push(name);
      return new Proxy(noop, handler);
    },
    apply(target, _, args) {
      route.push(...args.filter(x => x != null)); // eslint-disable-line eqeqeq
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler);
}

module.exports = buildRoute;
