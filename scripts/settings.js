import { MODULE } from "./constants.js";

/**
 *
 * @param updateFunc
 */
export function register(updateFunc) {
  game.settings.register(MODULE.ID, "abbreviateSkills", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.abbreviateSkills.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showSlowActions", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showSlowActions.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showSlowActions.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "displaySpellInfo", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.displaySpellInfo.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.displaySpellInfo.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showUnchargedItems", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnchargedItems.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnchargedItems.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showUnequippedItems", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnequippedItems.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnequippedItems.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showUnequippedItemsNpcs", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnequippedItemsNpcs.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnequippedItemsNpcs.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showUnpreparedSpells", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnpreparedSpells.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showUnpreparedSpells.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      updateFunc(value);
    }
  });

  game.settings.register(MODULE.ID, "showItemsWithoutActivationCosts", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showItemsWithoutActivationCosts.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showItemsWithoutActivationCosts.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      updateFunc(value);
    }
  });
}
