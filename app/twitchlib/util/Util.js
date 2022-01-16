'use strict';

const { Collection } = require('@discordjs/collection');

const isObject = d => typeof d === 'object' && d !== null;

/**
 * Contains various general-purpose utility methods.
 */
class TwitchUtil extends null {
  /**
   * Gets the return value from a single or multi point endpoint
   * @param {unknown} res the response from twitch
   * @param {boolean} cache whether to cache the fetched data if it wasn't already
   * @param {TwitchCachedManager} manager the manager to add data to
   * @param {string} [key] the name of the key for object returns, if not provided returns the collection
   * @returns {unknown}
   */
  static _getResReturn(res, cache, manager, key) {
    if (!res.data) return null;
    if (res.data.length < 1) return null;
    if (res.data.length === 1) return manager._add(res.data[0], cache);

    const objs = new Collection();
    for (const rawObj of res.data) {
      const obj = manager._add(rawObj, cache);
      objs.set(obj.id, obj);
    }
    if (!key) return objs;
    return { [key]: objs, cursor: res.pagination?.cursor ?? null };
  }

  /**
   * Flatten an object. Any properties that are collections will get converted to an array of keys.
   * @param {Object} obj The object to flatten.
   * @param {...Object<string, boolean|string>} [props] Specific properties to include/exclude.
   * @returns {Object}
   */
  static flatten(obj, ...props) {
    if (!isObject(obj)) return obj;

    const objProps = Object.keys(obj)
      .filter(k => !k.startsWith('_'))
      .map(k => ({ [k]: true }));

    props = objProps.length ? Object.assign(...objProps, ...props) : Object.assign({}, ...props);

    const out = {};

    for (let [prop, newProp] of Object.entries(props)) {
      if (!newProp) continue;
      newProp = newProp === true ? prop : newProp;

      const element = obj[prop];
      const elemIsObj = isObject(element);
      const valueOf = elemIsObj && typeof element.valueOf === 'function' ? element.valueOf() : null;

      // If it's a Collection, make the array of keys
      if (element instanceof Collection) out[newProp] = Array.from(element.keys());
      // If the valueOf is a Collection, use its array of keys
      else if (valueOf instanceof Collection) out[newProp] = Array.from(valueOf.keys());
      // If it's an array, flatten each element
      else if (Array.isArray(element)) out[newProp] = element.map(e => TwitchUtil.flatten(e));
      // If it's an object with a primitive `valueOf`, use that value
      else if (typeof valueOf !== 'object') out[newProp] = valueOf;
      // If it's a primitive
      else if (!elemIsObj) out[newProp] = element;
    }

    return out;
  }
}

module.exports = TwitchUtil;
