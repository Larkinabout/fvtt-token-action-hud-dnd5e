/**
 * Module-based constants
 */
export const MODULE = {
  ID: "token-action-hud-dnd5e"
};

/**
 * Core module
 */
export const CORE_MODULE = {
  ID: "token-action-hud-core"
};

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = "2.0";

/**
 * Action type
 */
export const ACTION_TYPE = {
  ability: "DND5E.Ability",
  check: "tokenActionHud.dnd5e.check",
  condition: "tokenActionHud.dnd5e.condition",
  counter: "tokenActionHud.dnd5e.counter",
  effect: "DND5E.Effect",
  exhaustion: "DND5E.Exhaustion",
  feature: "TYPES.Item.feat",
  item: "tokenActionHud.dnd5e.item",
  save: "DND5E.SAVE.Title.one",
  skill: "tokenActionHud.dnd5e.skill",
  spell: "TYPES.Item.spell",
  utility: "DND5E.ActionUtil"
};

/**
 * Activation types
 */
export const ACTIVATION_TYPE = {
  action: { group: "actions" },
  bonus: { group: "bonus-actions", icon: "fas fa-plus" },
  crew: { group: "crew-actions", icon: "fas fa-users" },
  day: { icon: "fas fa-hourglass-end" },
  hour: { icon: "fas fa-hourglass-half" },
  lair: { group: "lair-actions", icon: "fas fa-home" },
  minute: { icon: "fas fa-hourglass-start" },
  legendary: { group: "legendary-actions", icon: "fas fas fa-dragon" },
  reaction: { group: "reactions", icon: "fas fa-bolt" },
  reactiondamage: { group: "reactions", icon: "fas fa-bolt" },
  reactionmanual: { group: "reactions", icon: "fas fa-bolt" },
  special: { group: "special-actions", icon: "fas fa-star" },
  other: { group: "other-actions" }
};

/**
 * Concentration icon
 */
export const CONCENTRATION_ICON = "systems/dnd5e/icons/svg/statuses/concentrating.svg";

export const CUSTOM_DND5E = {
  ID: "custom-dnd5e",
  COUNTERS: {
    character: "character-counters",
    group: "group-counters",
    npc: "npc-counters"
  }
};

/**
 * Feature Group IDs
 */
export const FEATURE_GROUP_IDS = [
  "activeFeatures",
  "passiveFeatures",
  "backgroundFeatures",
  "classFeatures",
  "feats",
  "monsterFeatures",
  "raceFeatures",
  "artificerInfusions",
  "channelDivinity",
  "defensiveTactics",
  "eldritchInvocations",
  "elementalDisciplines",
  "fightingStyles",
  "huntersPrey",
  "kiAbilities",
  "maneuvers",
  "metamagicOptions",
  "multiattacks",
  "pactBoons",
  "psionicPowers",
  "runes",
  "superiorHuntersDefense"
];

/**
 * Groups
 */
export const GROUP = {
  _1stLevelSpells: { id: "1st-level-spells", name: "tokenActionHud.dnd5e.1stLevelSpells", spellMode: 1, type: "system" },
  _2ndLevelSpells: { id: "2nd-level-spells", name: "tokenActionHud.dnd5e.2ndLevelSpells", spellMode: 2, type: "system" },
  _3rdLevelSpells: { id: "3rd-level-spells", name: "tokenActionHud.dnd5e.3rdLevelSpells", spellMode: 3, type: "system" },
  _4thLevelSpells: { id: "4th-level-spells", name: "tokenActionHud.dnd5e.4thLevelSpells", spellMode: 4, type: "system" },
  _5thLevelSpells: { id: "5th-level-spells", name: "tokenActionHud.dnd5e.5thLevelSpells", spellMode: 5, type: "system" },
  _6thLevelSpells: { id: "6th-level-spells", name: "tokenActionHud.dnd5e.6thLevelSpells", spellMode: 6, type: "system" },
  _7thLevelSpells: { id: "7th-level-spells", name: "tokenActionHud.dnd5e.7thLevelSpells", spellMode: 7, type: "system" },
  _8thLevelSpells: { id: "8th-level-spells", name: "tokenActionHud.dnd5e.8thLevelSpells", spellMode: 8, type: "system" },
  _9thLevelSpells: { id: "9th-level-spells", name: "tokenActionHud.dnd5e.9thLevelSpells", spellMode: 9, type: "system" },
  abilities: { id: "abilities", name: "tokenActionHud.dnd5e.abilities", type: "system" },
  actions: { id: "actions", name: "DND5E.ActionPl", type: "system" },
  activeFeatures: { id: "active-features", name: "tokenActionHud.dnd5e.activeFeatures", type: "system" },
  additionalSpells: { id: "additional-spells", name: "DND5E.CAST.SECTIONS.Spellbook", type: "system" },
  artificerInfusions: { id: "artificer-infusions", name: "tokenActionHud.dnd5e.artificerInfusions", type: "system" },
  atWillSpells: { id: "at-will-spells", name: "tokenActionHud.dnd5e.atWillSpells", spellMode: "atwill", type: "system" },
  backgroundFeatures: { id: "background-features", name: "tokenActionHud.dnd5e.backgroundFeatures", type: "system" },
  bonusActions: { id: "bonus-actions", name: "tokenActionHud.dnd5e.bonusActions", type: "system" },
  cantrips: { id: "cantrips", name: "tokenActionHud.dnd5e.cantrips", spellMode: 0, type: "system" },
  channelDivinity: { id: "channel-divinity", name: "tokenActionHud.dnd5e.channelDivinity", type: "system" },
  checks: { id: "checks", name: "tokenActionHud.dnd5e.checks", type: "system" },
  classFeatures: { id: "class-features", name: "tokenActionHud.dnd5e.classFeatures", type: "system" },
  combat: { id: "combat", name: "tokenActionHud.combat", type: "system" },
  conditions: { id: "conditions", name: "tokenActionHud.dnd5e.conditions", type: "system" },
  consumables: { id: "consumables", name: "TYPES.Item.consumablePl", type: "system" },
  containers: { id: "containers", name: "TYPES.Item.containerPl", type: "system" },
  counters: { id: "counters", name: "tokenActionHud.dnd5e.counters", type: "system" },
  crewActions: { id: "crew-actions", name: "tokenActionHud.dnd5e.crewActions", type: "system" },
  defensiveTactics: { id: "defensive-tactics", name: "tokenActionHud.dnd5e.defensiveTactics", type: "system" },
  eldritchInvocations: { id: "eldritch-invocations", name: "tokenActionHud.dnd5e.eldritchInvocations", type: "system" },
  elementalDisciplines: { id: "elemental-disciplines", name: "tokenActionHud.dnd5e.elementalDisciplines", type: "system" },
  equipment: { id: "equipment", name: "TYPES.Item.equipmentPl", type: "system" },
  equipped: { id: "equipped", name: "DND5E.Equipped", type: "system" },
  exhaustion: { id: "exhaustion", name: "DND5E.Exhaustion", type: "system" },
  feats: { id: "feats", name: "tokenActionHud.dnd5e.feats", type: "system" },
  fightingStyles: { id: "fighting-styles", name: "tokenActionHud.dnd5e.fightingStyles", type: "system" },
  huntersPrey: { id: "hunters-prey", name: "tokenActionHud.dnd5e.huntersPrey", type: "system" },
  innateSpells: { id: "innate-spells", name: "tokenActionHud.dnd5e.innateSpells", spellMode: "innate", type: "system" },
  kiAbilities: { id: "ki-abilities", name: "tokenActionHud.dnd5e.kiAbilities", type: "system" },
  lairActions: { id: "lair-actions", name: "tokenActionHud.dnd5e.lairActions", type: "system" },
  legendaryActions: { id: "legendary-actions", name: "tokenActionHud.dnd5e.legendaryActions", type: "system" },
  loot: { id: "loot", name: "TYPES.Item.lootPl", type: "system" },
  maneuvers: { id: "maneuvers", name: "tokenActionHud.dnd5e.maneuvers", type: "system" },
  metamagicOptions: { id: "metamagic-options", name: "tokenActionHud.dnd5e.metamagicOptions", type: "system" },
  monsterFeatures: { id: "monster-features", name: "tokenActionHud.dnd5e.monsterFeatures", type: "system" },
  multiattacks: { id: "multiattacks", name: "tokenActionHud.dnd5e.multiattacks", type: "system" },
  otherActions: { id: "other-actions", name: "tokenActionHud.dnd5e.otherActions", type: "system" },
  pactBoons: { id: "pact-boons", name: "tokenActionHud.dnd5e.pactBoons", type: "system" },
  pactSpells: { id: "pact-spells", name: "tokenActionHud.dnd5e.pactSpells", spellMode: "pact", type: "system" },
  passiveEffects: { id: "passive-effects", name: "DND5E.EffectPassive", type: "system" },
  passiveFeatures: { id: "passive-features", name: "tokenActionHud.dnd5e.passiveFeatures", type: "system" },
  psionicPowers: { id: "psionic-powers", name: "tokenActionHud.dnd5e.psionicPowers", type: "system" },
  raceFeatures: { id: "race-features", name: "tokenActionHud.dnd5e.raceFeatures", type: "system" },
  reactions: { id: "reactions", name: "DND5E.ReactionPl", type: "system" },
  rests: { id: "rests", name: "tokenActionHud.dnd5e.rests", type: "system" },
  runes: { id: "runes", name: "tokenActionHud.dnd5e.runes", type: "system" },
  saves: { id: "saves", name: "DND5E.ClassSaves", type: "system" },
  skills: { id: "skills", name: "tokenActionHud.dnd5e.skills", type: "system" },
  superiorHuntersDefense: { id: "superior-hunters-defense", name: "tokenActionHud.dnd5e.superiorHuntersDefense", type: "system" },
  temporaryEffects: { id: "temporary-effects", name: "DND5E.EffectTemporary", type: "system" },
  token: { id: "token", name: "tokenActionHud.token", type: "system" },
  tools: { id: "tools", name: "TYPES.Item.toolPl", type: "system" },
  unequipped: { id: "unequipped", name: "DND5E.Unequipped", type: "system" },
  utility: { id: "utility", name: "tokenActionHud.utility", type: "system" },
  weapons: { id: "weapons", name: "TYPES.Item.weaponPl", type: "system" }
};

/**
 * Prepared icon
 */
export const PREPARED_ICON = "fas fa-sun";

/**
 * Proficiency level icons
 */
export const PROFICIENCY_LEVEL_ICON = {
  0: "fa-regular fa-circle",
  0.5: "fa-regular fa-circle-half-stroke",
  1: "fa-solid fa-circle",
  2: "fa-regular fa-circle-dot"
};

/**
 * Rarity
 */
export const RARITY = {
  common: "tokenActionHud.dnd5e.common",
  uncommon: "tokenActionHud.dnd5e.uncommon",
  rare: "tokenActionHud.dnd5e.rare",
  veryRare: "tokenActionHud.dnd5e.veryRare",
  legendary: "tokenActionHud.dnd5e.legendary",
  artifact: "tokenActionHud.dnd5e.artifact"
};

/**
 * Ritual icon
 */
export const RITUAL_ICON = "fas fa-circle-r";

/**
 * Spell Group IDs
 */
export const SPELL_GROUP_IDS = [
  "cantrips",
  "_1stLevelSpells",
  "_2ndLevelSpells",
  "_3rdLevelSpells",
  "_4thLevelSpells",
  "_5thLevelSpells",
  "_6thLevelSpells",
  "_7thLevelSpells",
  "_8thLevelSpells",
  "_9thLevelSpells",
  "atWillSpells",
  "innateSpells",
  "pactSpells",
  "additionalSpells"
];
