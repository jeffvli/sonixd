export default class Store {
  constructor(options={}) {
    this.name = options.name || "config.json";
    this.settings = options.defaults || {};
  }

  /**
   *
   * @param {string} key
   */
  _getParentObject(key) {
    const path = key.split(".");
    const final = path.at(-1);
    let object = this.settings;

    for (const part of path.slice(0, -1)) {
      object = object[part];

      if (object === undefined) {
        return [undefined, final];
      }
    }

    return [object, final];
  }

  /**
   *
   * @param {string} key 
   */
  has(key) {
    if (key.indexOf(".") !== -1) {
      let [parent, final] = this._getParentObject(key);
      return parent !== undefined && key in parent;
    } else {
      return key in this.settings;
    }
  }

  /**
   *
   * @param {string} key
   */
  get(key) {
    if (key.indexOf(".") !== -1) {
      let [parent, final] = this._getParentObject(key);

      return parent !== undefined ? parent[final] : undefined;
    } else {
      return this.settings[key];
    }
  }

  /**
   *
   * @param {string} key 
   * @param {any} value
   */
  set(key, value) {
    if (key.indexOf("." !== -1)) {
      const path = key.split(".");

      let object = this.settings;

      for (const part of path.slice(0, -1)) {
        if (!(part in object)) {
          object[part] = {};
        }

        object = object[part];
      }

      object[path.at(-1)] = value;
    } else {
      this.settings[key] = value;
    }
  }
}
