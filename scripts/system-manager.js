// System Module Imports
import { ActionHandler } from "./action-handler.js";
import { RollHandler as Core } from "./roll-handler.js";
import { DEFAULTS } from "./defaults.js";
import * as systemSettings from "./settings.js";

export let SystemManager = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  SystemManager = class SystemManager extends coreModule.api.SystemManager {
    /** @override */
    getActionHandler() {
      return new ActionHandler();
    }

    /* -------------------------------------------- */

    /** @override */
    getAvailableRollHandlers() {
      let coreTitle = "Core D&D5e";

      if (coreModule.api.Utils.isModuleActive("midi-qol")) {
        coreTitle += ` [supports ${coreModule.api.Utils.getModuleTitle("midi-qol")}]`;
      }

      const choices = { core: coreTitle };
      return choices;
    }

    /* -------------------------------------------- */

    /** @override */
    getRollHandler(rollHandlerId) {
      let rollHandler;
      switch (rollHandlerId) {
        case "core":
        default:
          rollHandler = new Core();
          break;
      }

      return rollHandler;
    }

    /* -------------------------------------------- */

    /** @override */
    registerSettings(onChangeFunction) {
      systemSettings.register(onChangeFunction);
    }

    /* -------------------------------------------- */

    /** @override */
    async registerDefaults() {
      return DEFAULTS;
    }
  };
});
