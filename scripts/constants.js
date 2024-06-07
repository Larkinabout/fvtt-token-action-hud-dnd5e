/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-dnd5e'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '1.5'

/**
 * Action type
 */
export const ACTION_TYPE = {
    ability: 'DND5E.Ability',
    check: 'tokenActionHud.dnd5e.check',
    condition: 'tokenActionHud.dnd5e.condition',
    counter: 'tokenActionHud.dnd5e.counter',
    effect: 'DND5E.Effect',
    exhaustion: 'DND5E.Exhaustion',
    feature: 'ITEM.TypeFeat',
    item: 'tokenActionHud.dnd5e.item',
    save: 'DND5E.ActionSave',
    skill: 'tokenActionHud.dnd5e.skill',
    spell: 'ITEM.TypeSpell',
    utility: 'DND5E.ActionUtil'
}

/**
 * Activation type icons
 */
export const ACTIVATION_TYPE_ICON = {
    bonus: 'fas fa-plus',
    crew: 'fas fa-users',
    day: 'fas fa-hourglass-end',
    hour: 'fas fa-hourglass-half',
    lair: 'fas fa-home',
    minute: 'fas fa-hourglass-start',
    legendary: 'fas fas fa-dragon',
    reaction: 'fas fa-bolt',
    special: 'fas fa-star'
}

/**
 * Concentration icon
 */
export const CONCENTRATION_ICON = 'systems/dnd5e/icons/svg/statuses/concentrating.svg'

/**
 * Conditions
 */
export const CONDITION = {
    blind: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.0b8N4FymGGfbZGpJ' },
    blinded: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.0b8N4FymGGfbZGpJ' },
    'Convenient Effect: Blinded': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.0b8N4FymGGfbZGpJ' },
    charmed: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.zZaEBrKkr66OWJvD' },
    'Convenient Effect: Charmed': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.zZaEBrKkr66OWJvD' },
    deaf: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.6G8JSjhn701cBITY' },
    deafened: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.6G8JSjhn701cBITY' },
    'Convenient Effect: Deafened': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.6G8JSjhn701cBITY' },
    fear: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.oreoyaFKnvZCrgij' },
    'Convenient Effect: Frightened': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.oreoyaFKnvZCrgij' },
    frightened: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.oreoyaFKnvZCrgij' },
    grappled: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.gYDAhd02ryUmtwZn' },
    'Convenient Effect: Grappled': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.gYDAhd02ryUmtwZn' },
    incapacitated: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.TpkZgLfxCmSndmpb' },
    'Convenient Effect: Incapacitated': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.TpkZgLfxCmSndmpb' },
    invisible: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.3UU5GCTVeRDbZy9u' },
    'Convenient Effect: Invisible': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.3UU5GCTVeRDbZy9u' },
    paralysis: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xnSV5hLJIMaTABXP' },
    paralyzed: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xnSV5hLJIMaTABXP' },
    'Convenient Effect: Paralyzed': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xnSV5hLJIMaTABXP' },
    petrified: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xaNDaW6NwQTgHSmi' },
    'Convenient Effect: Petrified': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xaNDaW6NwQTgHSmi' },
    poison: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.lq3TRI6ZlED8ABMx' },
    poisoned: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.lq3TRI6ZlED8ABMx' },
    'Convenient Effect: Poisoned': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.lq3TRI6ZlED8ABMx' },
    prone: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.y0TkcdyoZlOTmAFT' },
    'Convenient Effect: Prone': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.y0TkcdyoZlOTmAFT' },
    restrain: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cSVcyZyNe2iG1fIc' },
    restrained: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cSVcyZyNe2iG1fIc' },
    'Convenient Effect: Restrained': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cSVcyZyNe2iG1fIc' },
    stun: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.ZyZMUwA2rboh4ObS' },
    stunned: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.ZyZMUwA2rboh4ObS' },
    'Convenient Effect: Stunned': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.ZyZMUwA2rboh4ObS' },
    unconscious: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.UWw13ISmMxDzmwbd' },
    'Convenient Effect: Unconscious': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.UWw13ISmMxDzmwbd' },
    exhaustion: { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
    'Convenient Effect: Exhaustion 1': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
    'Convenient Effect: Exhaustion 2': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
    'Convenient Effect: Exhaustion 3': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
    'Convenient Effect: Exhaustion 4': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
    'Convenient Effect: Exhaustion 5': { uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' }
}

/**
 * Groups
 */
export const GROUP = {
    _1stLevelSpells: { id: '1st-level-spells', name: 'tokenActionHud.dnd5e.1stLevelSpells', type: 'system' },
    _2ndLevelSpells: { id: '2nd-level-spells', name: 'tokenActionHud.dnd5e.2ndLevelSpells', type: 'system' },
    _3rdLevelSpells: { id: '3rd-level-spells', name: 'tokenActionHud.dnd5e.3rdLevelSpells', type: 'system' },
    _4thLevelSpells: { id: '4th-level-spells', name: 'tokenActionHud.dnd5e.4thLevelSpells', type: 'system' },
    _5thLevelSpells: { id: '5th-level-spells', name: 'tokenActionHud.dnd5e.5thLevelSpells', type: 'system' },
    _6thLevelSpells: { id: '6th-level-spells', name: 'tokenActionHud.dnd5e.6thLevelSpells', type: 'system' },
    _7thLevelSpells: { id: '7th-level-spells', name: 'tokenActionHud.dnd5e.7thLevelSpells', type: 'system' },
    _8thLevelSpells: { id: '8th-level-spells', name: 'tokenActionHud.dnd5e.8thLevelSpells', type: 'system' },
    _9thLevelSpells: { id: '9th-level-spells', name: 'tokenActionHud.dnd5e.9thLevelSpells', type: 'system' },
    abilities: { id: 'abilities', name: 'tokenActionHud.dnd5e.abilities', type: 'system' },
    actions: { id: 'actions', name: 'DND5E.ActionPl', type: 'system' },
    activeFeatures: { id: 'active-features', name: 'tokenActionHud.dnd5e.activeFeatures', type: 'system' },
    artificerInfusions: { id: 'artificer-infusions', name: 'tokenActionHud.dnd5e.artificerInfusions', type: 'system' },
    atWillSpells: { id: 'at-will-spells', name: 'tokenActionHud.dnd5e.atWillSpells', type: 'system' },
    backgroundFeatures: { id: 'background-features', name: 'tokenActionHud.dnd5e.backgroundFeatures', type: 'system' },
    bonusActions: { id: 'bonus-actions', name: 'tokenActionHud.dnd5e.bonusActions', type: 'system' },
    cantrips: { id: 'cantrips', name: 'tokenActionHud.dnd5e.cantrips', type: 'system' },
    channelDivinity: { id: 'channel-divinity', name: 'tokenActionHud.dnd5e.channelDivinity', type: 'system' },
    checks: { id: 'checks', name: 'tokenActionHud.dnd5e.checks', type: 'system' },
    classFeatures: { id: 'class-features', name: 'tokenActionHud.dnd5e.classFeatures', type: 'system' },
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    conditions: { id: 'conditions', name: 'tokenActionHud.dnd5e.conditions', type: 'system' },
    consumables: { id: 'consumables', name: 'ITEM.TypeConsumablePl', type: 'system' },
    containers: { id: 'containers', name: 'ITEM.TypeContainerPl', type: 'system' },
    counters: { id: 'counters', name: 'tokenActionHud.dnd5e.counters', type: 'system' },
    crewActions: { id: 'crew-actions', name: 'tokenActionHud.dnd5e.crewActions', type: 'system' },
    defensiveTactics: { id: 'defensive-tactics', name: 'tokenActionHud.dnd5e.defensiveTactics', type: 'system' },
    eldritchInvocations: { id: 'eldritch-invocations', name: 'tokenActionHud.dnd5e.eldritchInvocations', type: 'system' },
    elementalDisciplines: { id: 'elemental-disciplines', name: 'tokenActionHud.dnd5e.elementalDisciplines', type: 'system' },
    equipment: { id: 'equipment', name: 'ITEM.TypeEquipmentPl', type: 'system' },
    equipped: { id: 'equipped', name: 'DND5E.Equipped', type: 'system' },
    exhaustion: { id: 'exhaustion', name: 'DND5E.Exhaustion', type: 'system' },
    feats: { id: 'feats', name: 'tokenActionHud.dnd5e.feats', type: 'system' },
    fightingStyles: { id: 'fighting-styles', name: 'tokenActionHud.dnd5e.fightingStyles', type: 'system' },
    huntersPrey: { id: 'hunters-prey', name: 'tokenActionHud.dnd5e.huntersPrey', type: 'system' },
    innateSpells: { id: 'innate-spells', name: 'tokenActionHud.dnd5e.innateSpells', type: 'system' },
    kiAbilities: { id: 'ki-abilities', name: 'tokenActionHud.dnd5e.kiAbilities', type: 'system' },
    lairActions: { id: 'lair-actions', name: 'tokenActionHud.dnd5e.lairActions', type: 'system' },
    legendaryActions: { id: 'legendary-actions', name: 'tokenActionHud.dnd5e.legendaryActions', type: 'system' },
    loot: { id: 'loot', name: 'ITEM.TypeLootPl', type: 'system' },
    maneuvers: { id: 'maneuvers', name: 'tokenActionHud.dnd5e.maneuvers', type: 'system' },
    metamagicOptions: { id: 'metamagic-options', name: 'tokenActionHud.dnd5e.metamagicOptions', type: 'system' },
    monsterFeatures: { id: 'monster-features', name: 'tokenActionHud.dnd5e.monsterFeatures', type: 'system' },
    multiattacks: { id: 'multiattacks', name: 'tokenActionHud.dnd5e.multiattacks', type: 'system' },
    otherActions: { id: 'other-actions', name: 'tokenActionHud.dnd5e.otherActions', type: 'system' },
    pactBoons: { id: 'pact-boons', name: 'tokenActionHud.dnd5e.pactBoons', type: 'system' },
    pactSpells: { id: 'pact-spells', name: 'tokenActionHud.dnd5e.pactSpells', type: 'system' },
    passiveEffects: { id: 'passive-effects', name: 'DND5E.EffectPassive', type: 'system' },
    passiveFeatures: { id: 'passive-features', name: 'tokenActionHud.dnd5e.passiveFeatures', type: 'system' },
    psionicPowers: { id: 'psionic-powers', name: 'tokenActionHud.dnd5e.psionicPowers', type: 'system' },
    raceFeatures: { id: 'race-features', name: 'tokenActionHud.dnd5e.raceFeatures', type: 'system' },
    reactions: { id: 'reactions', name: 'DND5E.ReactionPl', type: 'system' },
    rests: { id: 'rests', name: 'tokenActionHud.dnd5e.rests', type: 'system' },
    runes: { id: 'runes', name: 'tokenActionHud.dnd5e.runes', type: 'system' },
    saves: { id: 'saves', name: 'DND5E.ClassSaves', type: 'system' },
    skills: { id: 'skills', name: 'tokenActionHud.dnd5e.skills', type: 'system' },
    superiorHuntersDefense: { id: 'superior-hunters-defense', name: 'tokenActionHud.dnd5e.superiorHuntersDefense', type: 'system' },
    temporaryEffects: { id: 'temporary-effects', name: 'DND5E.EffectTemporary', type: 'system' },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    tools: { id: 'tools', name: 'ITEM.TypeToolPl', type: 'system' },
    unequipped: { id: 'unequipped', name: 'DND5E.Unequipped', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' },
    weapons: { id: 'weapons', name: 'ITEM.TypeWeaponPl', type: 'system' }
}

/**
 * Prepared icon
 */
export const PREPARED_ICON = 'fas fa-sun'

/**
 * Proficiency level icons
 */
export const PROFICIENCY_LEVEL_ICON = {
    0.5: 'fas fa-adjust',
    1: 'fas fa-check',
    2: 'fas fa-check-double'
}

/**
 * Rarity
 */
export const RARITY = {
    common: 'tokenActionHud.dnd5e.common',
    uncommon: 'tokenActionHud.dnd5e.uncommon',
    rare: 'tokenActionHud.dnd5e.rare',
    veryRare: 'tokenActionHud.dnd5e.veryRare',
    legendary: 'tokenActionHud.dnd5e.legendary',
    artifact: 'tokenActionHud.dnd5e.artifact'
}

/**
 * Ritual icon
 */
export const RITUAL_ICON = 'fas fa-circle-r'

/**
 * Weapon properties
 */
export const WEAPON_PROPERTY = {
    ada: 'DND5E.WeaponPropertiesAda',
    amm: 'DND5E.WeaponPropertiesAmm',
    fin: 'DND5E.WeaponPropertiesFin',
    fir: 'DND5E.WeaponPropertiesFir',
    foc: 'DND5E.WeaponPropertiesFoc',
    hvy: 'DND5E.WeaponPropertiesHvy',
    lgt: 'DND5E.WeaponPropertiesLgt',
    lod: 'DND5E.WeaponPropertiesLod',
    mgc: 'DND5E.WeaponPropertiesMgc',
    rch: 'DND5E.WeaponPropertiesRch',
    rel: 'DND5E.WeaponPropertiesRel',
    ret: 'DND5E.WeaponPropertiesRet',
    sil: 'DND5E.WeaponPropertiesSil',
    spc: 'DND5E.WeaponPropertiesSpc',
    thr: 'DND5E.WeaponPropertiesThr',
    two: 'DND5E.WeaponPropertiesTwo',
    ver: 'DND5E.WeaponPropertiesVer'
}
