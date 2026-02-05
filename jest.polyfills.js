// Early polyfills - must run before jest-expo/preset
if (typeof global.FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this._data = new Map();
    }
    append(key, value) {
      this._data.set(key, value);
    }
    get(key) {
      return this._data.get(key);
    }
    has(key) {
      return this._data.has(key);
    }
    delete(key) {
      this._data.delete(key);
    }
    entries() {
      return this._data.entries();
    }
    keys() {
      return this._data.keys();
    }
    values() {
      return this._data.values();
    }
    forEach(callback, thisArg) {
      this._data.forEach((value, key) => callback.call(thisArg, value, key, this));
    }
  };
}
