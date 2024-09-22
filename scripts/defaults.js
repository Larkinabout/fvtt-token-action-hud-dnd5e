import { GROUP } from "./constants.js";

/**
 * Default categories and groups
 */
export let DEFAULTS = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  const groups = GROUP;
  Object.values(groups).forEach(group => {
    group.name = coreModule.api.Utils.i18n(group.name);
    group.listName = `Group: ${coreModule.api.Utils.i18n(group.name)}`;
  });
  const groupsArray = Object.values(groups);
  DEFAULTS = {
    layout: [
      {
        nestId: "inventory",
        id: "inventory",
        name: coreModule.api.Utils.i18n("DND5E.Inventory"),
        groups: [
          { ...groups.weapons, nestId: "inventory_weapons" },
          { ...groups.equipment, nestId: "inventory_equipment" },
          { ...groups.consumables, nestId: "inventory_consumables" },
          { ...groups.tools, nestId: "inventory_tools" },
          { ...groups.containers, nestId: "inventory_containers" },
          { ...groups.loot, nestId: "inventory_loot" }
        ]
      },
      {
        nestId: "features",
        id: "features",
        name: coreModule.api.Utils.i18n("DND5E.Features"),
        groups: [
          { ...groups.activeFeatures, nestId: "features_active-features" },
          { ...groups.passiveFeatures, nestId: "features_passive-features" }
        ]
      },
      {
        nestId: "spells",
        id: "spells",
        name: coreModule.api.Utils.i18n("TYPES.Item.spellPl"),
        groups: [
          { ...groups.atWillSpells, nestId: "spells_at-will-spells" },
          { ...groups.innateSpells, nestId: "spells_innate-spells" },
          { ...groups.pactSpells, nestId: "spells_pact-spells" },
          { ...groups.cantrips, nestId: "spells_cantrips" },
          { ...groups._1stLevelSpells, nestId: "spells_1st-level-spells" },
          { ...groups._2ndLevelSpells, nestId: "spells_2nd-level-spells" },
          { ...groups._3rdLevelSpells, nestId: "spells_3rd-level-spells" },
          { ...groups._4thLevelSpells, nestId: "spells_4th-level-spells" },
          { ...groups._5thLevelSpells, nestId: "spells_5th-level-spells" },
          { ...groups._6thLevelSpells, nestId: "spells_6th-level-spells" },
          { ...groups._7thLevelSpells, nestId: "spells_7th-level-spells" },
          { ...groups._8thLevelSpells, nestId: "spells_8th-level-spells" },
          { ...groups._9thLevelSpells, nestId: "spells_9th-level-spells" }
        ]
      },
      {
        nestId: "attributes",
        id: "attributes",
        name: coreModule.api.Utils.i18n("DND5E.Attributes"),
        groups: [
          { ...groups.abilities, nestId: "attributes_abilities" },
          { ...groups.skills, nestId: "attributes_skills" }
        ]
      },
      {
        nestId: "effects",
        id: "effects",
        name: coreModule.api.Utils.i18n("DND5E.Effects"),
        groups: [
          { ...groups.temporaryEffects, nestId: "effects_temporary-effects" },
          { ...groups.passiveEffects, nestId: "effects_passive-effects" },
          { ...groups.conditions, nestId: "effects_conditions" }
        ]
      },
      {
        nestId: "utility",
        id: "utility",
        name: coreModule.api.Utils.i18n("tokenActionHud.utility"),
        groups: [
          { ...groups.combat, nestId: "utility_combat" },
          { ...groups.token, nestId: "utility_token" },
          { ...groups.rests, nestId: "utility_rests" },
          { ...groups.utility, nestId: "utility_utility" }
        ]
      }
    ],
    groups: groupsArray
  };
});
