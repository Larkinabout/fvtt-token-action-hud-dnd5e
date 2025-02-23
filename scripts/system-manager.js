// System Module Imports
import { ActionHandler } from "./action-handler.js";
import { MagicItemActionHandlerExtender } from "./magic-items-extender.js";
import { RollHandler as Core } from "./roll-handler.js";
import { DEFAULTS } from "./defaults.js";
import * as systemSettings from "./settings.js";

export let SystemManager = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  SystemManager = class SystemManager extends coreModule.api.SystemManager {
    /** @override */
    getActionHandler() {
      const actionHandler = new ActionHandler();
      if (coreModule.api.Utils.isModuleActive("magic-items-2")
        || coreModule.api.Utils.isModuleActive("magicitems")) {
        actionHandler.addActionHandlerExtender(new MagicItemActionHandlerExtender(actionHandler));
      }
      return actionHandler;
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
      const defaults = DEFAULTS;
      // If the 'Magic Items' module is active, then add a group for it
      if (game.modules.get("magicitems")?.active || game.modules.get("magic-items-2")?.active) {
        const name = coreModule.api.Utils.i18n("tokenActionHud.dnd5e.magicItems");
        defaults.groups.push(
          {
            id: "magic-items",
            name,
            listName: `Group: ${name}`,
            type: "system"
          }
        );
        defaults.groups.sort((a, b) => a.id.localeCompare(b.id));
      }
      return defaults;
    }
  };
});
