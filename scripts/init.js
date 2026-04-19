import { SystemManager } from "./system-manager.js";
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from "./constants.js";

Hooks.on("tokenActionHudCoreApiReady", async () => {
  const module = game.modules.get(MODULE.ID);
  module.api = {
    requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
    SystemManager
  };
  Hooks.call("tokenActionHudSystemReady", module);
});

/* -------------------------------------------- */

/**
 * Get context item.
 * @param {object} hudManager
 * @param {HTMLElement} target
 * @returns {object|null} Item
 */
function getContextItem(hudManager, target) {
  const action = hudManager.actionHandler.availableActions.get(target.dataset.actionId);
  const itemId = action?.system?.actionId;
  return itemId ? hudManager.actor?.items?.get(itemId) ?? null : null;
}

/* -------------------------------------------- */

Hooks.on("tokenActionHudCoreActionContextMenu", (items, hudManager) => {
  items.push({
    label: "tokenActionHud.dnd5e.equip",
    icon: "<i class='fa-solid fa-shield-halved'></i>",
    visible: target => {
      const action = hudManager.actionHandler.availableActions.get(target.dataset.actionId);
      return !!action?.system?.item && action.system.equipped === false;
    },
    onClick: (event, target) => {
      getContextItem(hudManager, target)?.update({ "system.equipped": true });
    }
  });

  items.push({
    label: "tokenActionHud.dnd5e.unequip",
    icon: "<i class='fa-solid fa-shield-halved'></i>",
    visible: target => {
      const action = hudManager.actionHandler.availableActions.get(target.dataset.actionId);
      return !!action?.system?.item && action.system.equipped === true;
    },
    onClick: (event, target) => {
      getContextItem(hudManager, target)?.update({ "system.equipped": false });
    }
  });

  items.push({
    label: "tokenActionHud.dnd5e.viewItem",
    icon: "<i class='fa-solid fa-eye'></i>",
    visible: target => target.dataset.hasContextMenu === "true",
    onClick: (event, target) => {
      getContextItem(hudManager, target)?.sheet?.render(true);
    }
  });
});
