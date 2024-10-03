import { MODULE } from "./constants.js";

export let Utils = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  Utils = class Utils {
    /**
     * Capitalize the first letter of every word
     * @param {string} value The string to capitalize
     * @returns {string}     The capitalized string
     */
    static capitalize(value) {
      return value.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
      );
    }

    /**
     * Get setting value
     * @param {string} key The key
     * @param {string=null} defaultValue The default value
     * @returns {*} The setting value
     */
    static getSetting(key, defaultValue = null) {
      let value = defaultValue ?? null;
      try {
        value = game.settings.get(MODULE.ID, key);
      } catch{
        coreModule.api.Logger.debug(`Setting '${key}' not found`);
      }
      return value;
    }

    /**
     * Set setting value
     * @param {string} key The key
     * @param {string} value The value
     */
    static async setSetting(key, value) {
      try {
        value = await game.settings.set(MODULE.ID, key, value);
        coreModule.api.Logger.debug(`Setting '${key}' set to '${value}'`);
      } catch{
        coreModule.api.Logger.debug(`Setting '${key}' not found`);
      }
    }
  };
});
