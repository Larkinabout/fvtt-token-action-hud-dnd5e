// System Module Imports
import {
  ACTIVATION_TYPE, ACTION_TYPE, CONCENTRATION_ICON, CUSTOM_DND5E, FEATURE_GROUP_IDS,
  PREPARED_ICON, PROFICIENCY_LEVEL_ICON, RARITY, SPELL_GROUP_IDS
} from "./constants.js";
import { Utils } from "./utils.js";

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    // Initialize action variables
    featureActions = null;

    inventoryActions = null;

    spellActions = null;

    /**
     * Build System Actions
     * @override
     * @param {Array} groupIds
     * @returns {object}
     */
    async buildSystemActions(groupIds) {
      // Set actor and token variables
      this.actors = (!this.actor) ? this.#getValidActors() : [this.actor];
      this.tokens = (!this.token) ? this.#getValidTokens() : [this.token];

      // Set items variable
      if (this.actor) {
        this.items = coreModule.api.Utils.sortItemsByName(this.#discardSlowItems(this.actor.items));
      }

      // Set settings variables
      this.abbreviateSkills = Utils.getSetting("abbreviateSkills");
      this.displaySpellInfo = Utils.getSetting("displaySpellInfo");
      this.showItemsWithoutActivationCosts = Utils.getSetting("showItemsWithoutActivationCosts");
      this.showUnchargedItems = Utils.getSetting("showUnchargedItems");
      this.showUnequippedItems = Utils.getSetting("showUnequippedItems");
      if (this.actor?.type === "npc" && !this.showUnequippedItems) {
        this.showUnequippedItems = Utils.getSetting("showUnequippedItemsNpcs");
      }
      this.showUnpreparedSpells = Utils.getSetting("showUnpreparedSpells");

      this.activationgroupIds = [
        "actions",
        "bonus-actions",
        "crew-actions",
        "lair-actions",
        "legendary-actions",
        "reactions",
        "other-actions"
      ];

      if (this.actor?.type === "character" || this.actor?.type === "npc") {
        this.inventorygroupIds = [
          "equipped",
          "consumables",
          "containers",
          "equipment",
          "loot",
          "tools",
          "weapons",
          "unequipped"
        ];

        await this.#buildCharacterActions();
      } else if (this.actor?.type === "vehicle") {
        this.inventorygroupIds = [
          "consumables",
          "equipment",
          "tools",
          "weapons"
        ];

        await this.#buildVehicleActions();
      } else if (!this.actor) {
        await this.#buildMultipleTokenActions();
      }
    }

    /**
     * Build character actions
     * @private
     * @returns {object}
     */
    async #buildCharacterActions() {
      await Promise.all([
        this.#buildConditions(),
        this.#buildEffects(),
        this.#buildFeatures(),
        this.#buildInventory(),
        this.#buildSpells()
      ]);
      this.#buildAbilities("ability", "abilities");
      this.#buildAbilities("check", "checks");
      this.#buildAbilities("save", "saves");
      this.#buildCombat();
      this.#buildCounters();
      this.#buildExhaustion();
      this.#buildRests();
      this.#buildSkills();
      this.#buildUtility();
    }

    /**
     * Build vehicle actions
     * @private
     * @returns {object}
     */
    async #buildVehicleActions() {
      await Promise.all([
        this.#buildConditions(),
        this.#buildEffects(),
        this.#buildFeatures(),
        this.#buildInventory()
      ]);
      this.#buildAbilities("ability", "abilities");
      this.#buildAbilities("check", "checks");
      this.#buildAbilities("save", "saves");
      this.#buildCombat();
      this.#buildUtility();
    }

    /**
     * Build multiple token actions
     * @private
     * @returns {object}
     */
    async #buildMultipleTokenActions() {
      this.#buildAbilities("ability", "abilities");
      this.#buildAbilities("check", "checks");
      this.#buildAbilities("save", "saves");
      this.#buildCombat();
      await this.#buildConditions();
      this.#buildRests();
      this.#buildSkills();
      this.#buildUtility();
    }

    /**
     * Build abilities
     * @private
     * @param {string} actionType
     * @param {string} groupId
     */
    #buildAbilities(actionType, groupId) {
      // Get abilities
      const abilities = this.actor?.system.abilities || CONFIG.DND5E.abilities;

      // Exit if no abilities exist
      if (abilities.length === 0) return;

      // Helper to build each action
      const buildAction = (abilityId, ability) => {
        const name = CONFIG.DND5E.abilities[abilityId].label;
        const mod = (groupId === "saves") ? ability?.save : ability?.mod;
        return {
          id: `${actionType}-${abilityId}`,
          name: (this.abbreviateSkills) ? coreModule.api.Utils.capitalize(abilityId) : name,
          encodedValue: [actionType, abilityId].join(this.delimiter),
          icon1: (groupId !== "checks") ? this.#getProficiencyIcon(abilities[abilityId].proficient) : "",
          info1: (this.actor) ? { text: coreModule.api.Utils.getModifier(mod) } : null,
          info2: (this.actor && groupId === "abilities") ? { text: `(${coreModule.api.Utils.getModifier(ability?.save)})` } : null,
          listName: this.#getListName(actionType, name)
        };
      };

      // Get actions
      const actions = Object.entries(abilities)
        .filter(ability => abilities[ability[0]].value !== 0)
        .map(([abilityId, ability]) => { return buildAction(abilityId, ability); });

      // Create group data
      const groupData = { id: groupId };

      // Add actions to action list
      this.addActions(actions, groupData);
    }

    /**
     * Build activations
     * @public
     * @param {object} data  groupData, actionData, actionType
     */
    async buildActivations(data) {
      const { groupData, actionData, actionType = "item" } = data;

      // Create map of items according to activation type
      const activationItems = new Map();

      // Loop items and add to activationItems
      for (const [key, value] of actionData) {
        const activationType = value.system?.activities?.contents[0]?.activation?.type;
        const groupId = ACTIVATION_TYPE[activationType]?.group ?? "other";
        if (!activationItems.has(groupId)) activationItems.set(groupId, new Map());
        activationItems.get(groupId).set(key, value);
      }

      // Loop through action group ids
      for (const value of Object.values(ACTIVATION_TYPE)) {
        const group = value.group;

        // Skip if no items exist
        if (!activationItems.has(group)) continue;

        // Clone and add to group data
        const groupDataClone = { ...groupData, id: `${group}+${groupData.id}`, type: "system-derived" };

        // Set Equipped and Unequipped groups to not selected by default
        if (["equipped", "unequipped"].includes(groupData.id)) { groupDataClone.defaultSelected = false; }

        // Create parent group data
        const parentgroupData = { id: group, type: "system" };

        // Add group to HUD
        await this.addGroup(groupDataClone, parentgroupData);

        // Add spell slot info to group
        if (actionType === "spell") { this.addGroupInfo(groupDataClone); }

        // Build actions
        await this.buildActions({
          groupData: groupDataClone,
          actionData: activationItems.get(group),
          actionType
        });
      }
    }

    /**
     * Build combat
     * @private
     */
    #buildCombat() {
      const actionType = "utility";

      // Set combat types
      const combatTypes = {
        initiative: { id: "initiative", name: "tokenActionHud.dnd5e.rollInitiative" },
        endTurn: { id: "endTurn", name: "tokenActionHud.endTurn" }
      };

      // Delete endTurn for multiple tokens
      if (game.combat?.current?.tokenId !== this.token?.id) delete combatTypes.endTurn;

      const tokens = coreModule.api.Utils.getControlledTokens();
      const tokenIds = tokens?.map(token => token.id);
      const combatants = (game.combat)
        ? game.combat.combatants.filter(combatant => tokenIds.includes(combatant.tokenId))
        : [];

      const getInfo1 = combatTypeId => {
        if (combatTypeId === "initiative" && combatants.length === 1) {
          // Get initiative for single token
          const currentInitiative = combatants[0].initiative;
          return { class: "tah-spotlight", text: currentInitiative };
        }
        return {};
      };

      const getActive = () => {
        return combatants.length > 0 && (combatants.every(combatant => combatant?.initiative)) ? " active" : "";
      };

      // Get actions
      const actions = Object.values(combatTypes).map(combatType => {
        return {
          id: combatType.id,
          name: game.i18n.localize(combatType.name),
          encodedValue: [actionType, combatType.id].join(this.delimiter),
          info1: getInfo1(combatType.id),
          cssClass: (combatType.id === "initiative" ) ? `toggle${getActive()}` : "",
          listName: this.#getListName(actionType, combatType.name)
        };
      });

      // Create group data
      const groupData = { id: "combat" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build conditions
     * @private
     */
    async #buildConditions() {
      if (this.tokens?.length === 0) return;

      const actionType = "condition";

      // Get conditions
      const conditions = CONFIG.statusEffects.filter(condition => condition.id !== "");

      // Exit if no conditions exist
      if (conditions.length === 0) return;

      // Get actions
      const actions = await Promise.all(conditions.map(async condition => {
        const hasCondition = this.actors.every(actor => {
          return actor.effects.some(effect => effect.statuses.some(status => status === condition.id)
          && !effect?.disabled);
        });
        const name = game.i18n.localize(condition.label) ?? condition.name;
        return {
          id: condition.id,
          name,
          encodedValue: [actionType, condition.id].join(this.delimiter),
          img: coreModule.api.Utils.getImage(condition),
          cssClass: `toggle${(hasCondition) ? " active" : ""}`,
          listName: this.#getListName(actionType, name),
          tooltip: await this.#getTooltip(await this.#getConditionTooltipData(condition.id, condition.name))
        };
      }));

      // Create group data
      const groupData = { id: "conditions" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build counters
     * @private
     */
    async #buildCounters() {
      if (!CUSTOM_DND5E.COUNTERS[this.actor?.type]) return;

      const actionType = "counter";

      let counters = game.settings.get(CUSTOM_DND5E.ID, CUSTOM_DND5E.COUNTERS[this.actor?.type]) ?? [];

      if (coreModule.api.Utils.isModuleActive(CUSTOM_DND5E.ID) && counters.length) {
        counters = Object.entries(counters)
          .filter(([_, value]) => value.visible)
          .map(([key, value]) => {
            value.key = key;
            return value;
          });
      } else {
        counters = [
          {
            name: game.i18n.localize("DND5E.DeathSave"),
            type: "successFailure",
            system: true,
            visible: true,
            key: "death-saves"
          },
          {
            name: game.i18n.localize("DND5E.Exhaustion"),
            type: "number",
            system: true,
            visible: true,
            key: "exhaustion"
          },
          {
            name: game.i18n.localize("DND5E.Inspiration"),
            type: "checkbox",
            system: true,
            visible: true,
            key: "inspiration"
          }
        ];
      }

      // Get actions
      const actions = counters.map(counter => {
        let active = "";
        let cssClass = "";
        let img = "";
        let info1 = "";
        if (counter.system) {
          switch (counter.key) {
            case "exhaustion":
              active = (this.actor.system.attributes.exhaustion > 0) ? " active" : "";
              cssClass = `toggle${active}`;
              img = coreModule.api.Utils.getImage("modules/token-action-hud-dnd5e/icons/exhaustion.svg");
              info1 = { text: this.actor.system.attributes.exhaustion };
              break;
            case "death-saves":
              img = coreModule.api.Utils.getImage("modules/token-action-hud-dnd5e/icons/death-saves.svg");
              info1 = { text: `${this.actor.system.attributes.death.success}/${this.actor.system.attributes.death.failure}` };
              break;
            case "inspiration":
              active = (this.actor.system.attributes.inspiration) ? " active" : "";
              cssClass = `toggle${active}`;
              img = coreModule.api.Utils.getImage("modules/token-action-hud-dnd5e/icons/inspiration.svg");
              break;
          }
        } else {
          const value = this.actor.getFlag(CUSTOM_DND5E.ID, counter.key);
          switch (counter.type) {
            case "checkbox":
              active = (value) ? " active" : "";
              cssClass = `toggle${active}`;
              break;
            case "number":
              active = (value > 0) ? " active" : "";
              cssClass = `toggle${active}`;
              info1 = { text: value };
              break;
            case "successFailure":
              info1 = { text: `${value?.success ?? 0}/${value?.failure ?? 0}` };
              break;
          }
        }

        return {
          id: counter.key,
          name: counter.name,
          listName: this.#getListName(actionType, counter.name),
          encodedValue: [actionType, (counter.system) ? counter.key : encodeURIComponent(`${counter.key}>${counter.type}`)].join(this.delimiter),
          cssClass,
          img,
          info1
        };
      });

      // Create group data
      const groupData = { id: "counters" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build effects
     * @private
     */
    async #buildEffects() {
      const actionType = "effect";

      // Get effects
      const effects = new Map();
      for (const effect of this.actor.allApplicableEffects()) { effects.set(effect.id, effect); }

      // Exit if no effects exist
      if (effects.size === 0) return;

      // Map passive and temporary effects to new maps
      const passiveEffects = new Map();
      const temporaryEffects = new Map();
      const conditionIds = Object.keys(CONFIG.DND5E.conditionTypes).map(key => { return dnd5e.utils.staticID(`dnd5e${key}`); });

      // Iterate effects and add to a map based on the isTemporary value
      for (const [effectId, effect] of effects.entries()) {
        if (effect.isSuppressed) continue;
        if (effect.parent?.system?.identified === false && !game.user.isGM) continue;
        if (conditionIds.includes(effect.id)) continue;

        const isTemporary = effect.isTemporary;
        if (isTemporary) {
          temporaryEffects.set(effectId, effect);
        } else {
          passiveEffects.set(effectId, effect);
        }
      }

      await Promise.all([
        // Build passive effects
        this.buildActions({ groupData: { id: "passive-effects", type: "system" }, actionData: passiveEffects, actionType }),
        // Build temporary effects
        this.buildActions({ groupData: { id: "temporary-effects", type: "system" }, actionData: temporaryEffects, actionType })
      ]);
    }

    /**
     * Build exhaustion
     * @private
     */
    #buildExhaustion() {
      // Exit if every actor is not the character type
      if (this.actors.length === 0) return;
      if (!this.actors.every(actor => actor.type === "character")) return;

      const actionType = "exhaustion";
      const active = this.actor.system.attributes.exhaustion > 0 ? " active" : "";

      // Get actions
      const actions = [{
        cssClass: `toggle${active}`,
        id: "exhaustion",
        name: game.i18n.localize("DND5E.Exhaustion"),
        encodedValue: [actionType, "exhaustion"].join(this.delimiter),
        img: coreModule.api.Utils.getImage("modules/token-action-hud-dnd5e/icons/exhaustion.svg"),
        info1: { text: this.actor.system.attributes.exhaustion },
        listName: this.#getListName(actionType, name)
      }];

      // Create group data
      const groupData = { id: "exhaustion" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build features
     * @private
     */
    async #buildFeatures() {
      const actionType = "feature";

      // Get feats
      const feats = new Map();
      for (const [key, value] of this.items) {
        const type = value.type;
        if (type === "feat") feats.set(key, value);
      }

      // Early exit if no feats exist
      if (feats.size === 0) return;

      // Map active and passive features to new maps
      const featuresMap = new Map();

      const featureTypes = [
        { type: "background", groupId: "background-features" },
        { type: "class", groupId: "class-features" },
        { type: "monster", groupId: "monster-features" },
        { type: "race", groupId: "race-features" },
        { type: "feats", groupId: "feats" }
      ];

      const classFeatureTypes = [
        { type: "artificerInfusion", groupId: "artificer-infusions" },
        { type: "channelDivinity", groupId: "channel-divinity" },
        { type: "defensiveTactic", groupId: "defensive-tactics" },
        { type: "eldritchInvocation", groupId: "eldritch-invocations" },
        { type: "elementalDiscipline", groupId: "elemental-disciplines" },
        { type: "fightingStyle", groupId: "fighting-styles" },
        { type: "huntersPrey", groupId: "hunters-prey" },
        { type: "ki", groupId: "ki-abilities" },
        { type: "maneuver", groupId: "maneuvers" },
        { type: "metamagic", groupId: "metamagic-options" },
        { type: "multiattack", groupId: "multiattacks" },
        { type: "pact", groupId: "pact-boons" },
        { type: "psionicPower", groupId: "psionic-powers" },
        { type: "rune", groupId: "runes" },
        { type: "superiorHuntersDefense", groupId: "superior-hunters-defense" }
      ];

      for (const [key, value] of feats) {
        const activationType = value.system.activities.contents[0]?.type;
        const type = value.system.type.value;
        const subType = value.system.type?.subtype;
        if (activationType) {
          if (!featuresMap.has("active-features")) featuresMap.set("active-features", new Map());
          featuresMap.get("active-features").set(key, value);
        }
        if (!activationType || activationType === "") {
          if (!featuresMap.has("passive-features")) featuresMap.set("passive-features", new Map());
          featuresMap.get("passive-features").set(key, value);
        }
        for (const featureType of featureTypes) {
          const groupId = featureType.groupId;
          if (featureType.type === type) {
            if (!featuresMap.has(groupId)) featuresMap.set(groupId, new Map());
            featuresMap.get(groupId).set(key, value);
          }
        }
        for (const featureType of classFeatureTypes) {
          const groupId = featureType.groupId;
          if (subType && featureType.type === subType) {
            if (!featuresMap.has(groupId)) featuresMap.set(groupId, new Map());
            featuresMap.get(groupId).set(key, value);
          }
        }
      }

      // Create group name mappings
      const groupNameMappings = {
        "active-features": game.i18n.localize("tokenActionHud.dnd5e.activeFeatures"),
        "passive-features": game.i18n.localize("tokenActionHud.dnd5e.passiveFeatures")
      };

      // Loop through inventory groups ids
      for (const groupId of FEATURE_GROUP_IDS) {
        if (!featuresMap.has(groupId)) continue;

        // Create group data
        const groupData = {
          id: groupId,
          name: groupNameMappings[groupId] ?? ""
        };

        const actionData = featuresMap.get(groupId);
        const data = { groupData, actionData, actionType };

        // Build actions
        await this.buildActions(data);

        // Build activations
        if (groupNameMappings[groupId]) await this.buildActivations(data);
      }
    }

    /**
     * Build inventory
     * @private
     */
    async #buildInventory() {
      // Exit early if no items exist
      if (this.items.size === 0) return;

      const inventoryMap = new Map();

      for (const [key, value] of this.items) {
        // Set variables
        const equipped = value.system.equipped;
        const hasQuantity = value.system?.quantity > 0;
        const isActiveItem = this.#isActiveItem(value);
        const isUsableItem = this.#isUsableItem(value);
        const isEquippedItem = this.#isEquippedItem(value);
        const type = value.type;

        // Set items into maps
        if (hasQuantity && isActiveItem) {
          if (equipped) {
            if (!inventoryMap.has("equipped")) inventoryMap.set("equipped", new Map());
            inventoryMap.get("equipped").set(key, value);
          }
          if (!equipped) {
            if (!inventoryMap.has("unequipped")) inventoryMap.set("unequipped", new Map());
            inventoryMap.get("unequipped").set(key, value);
          }
          if (isUsableItem && type === "consumable") {
            if (!inventoryMap.has("consumables")) inventoryMap.set("consumables", new Map());
            inventoryMap.get("consumables").set(key, value);
          }
          if (isEquippedItem) {
            if (type === "container") {
              if (!inventoryMap.has("containers")) inventoryMap.set("containers", new Map());
              inventoryMap.get("containers").set(key, value);
            }
            if (type === "equipment") {
              if (!inventoryMap.has("equipment")) inventoryMap.set("equipment", new Map());
              inventoryMap.get("equipment").set(key, value);
            }
            if (type === "loot") {
              if (!inventoryMap.has("loot")) inventoryMap.set("loot", new Map());
              inventoryMap.get("loot").set(key, value);
            }
            if (type === "tool") {
              if (!inventoryMap.has("tools")) inventoryMap.set("tools", new Map());
              inventoryMap.get("tools").set(key, value);
            }
            if (type === "weapon") {
              if (!inventoryMap.has("weapons")) inventoryMap.set("weapons", new Map());
              inventoryMap.get("weapons").set(key, value);
            }
          }
        }
      }

      // Create group name mappings
      const groupNameMappings = {
        equipped: "DND5E.Equipped",
        unequipped: "DND5E.Unequipped",
        consumables: "TYPES.Item.consumablePl",
        containers: "TYPES.Item.containerPl",
        equipment: "TYPES.Item.equipmentPl",
        loot: "TYPES.Item.lootPl",
        tools: "TYPES.Item.toolPl",
        weapons: "TYPES.Item.weaponPl"
      };

      // Loop through inventory subcateogry ids
      for (const groupId of this.inventorygroupIds) {
        if (!inventoryMap.has(groupId)) continue;

        // Create group data
        const groupData = {
          id: groupId,
          name: game.i18n.localize(groupNameMappings[groupId])
        };

        const actionData = inventoryMap.get(groupId);
        const data = { groupData, actionData };

        // Build actions
        await this.buildActions(data);

        // Build activations
        await this.buildActivations(data);
      }
    }

    /**
     * Build rests
     * @private
     */
    #buildRests() {
      // Exit if every actor is not the character type
      if (this.actors.length === 0) return;
      if (!this.actors.every(actor => actor.type === "character")) return;

      const actionType = "utility";

      // Set rest types
      const restTypes = {
        shortRest: { name: game.i18n.localize("DND5E.ShortRest") },
        longRest: { name: game.i18n.localize("DND5E.LongRest") }
      };

      // Get actions
      const actions = Object.entries(restTypes)
        .map(restType => {
          const id = restType[0];
          const name = restType[1].name;
          const encodedValue = [actionType, id].join(this.delimiter);
          return {
            id,
            name,
            encodedValue,
            listName: this.#getListName(actionType, name)
          };
        });

      // Create group data
      const groupData = { id: "rests" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build skills
     * @private
     */
    #buildSkills() {
      const actionType = "skill";

      // Get skills
      const skills = this.actor?.system.skills || CONFIG.DND5E.skills;

      // Exit if there are no skills
      if (skills.length === 0) return;

      // Get actions
      const actions = Object.entries(skills)
        .map(([id, skill]) => {
          try {
            const name = CONFIG.DND5E.skills[id].label;
            return {
              id,
              name: this.abbreviateSkills ? coreModule.api.Utils.capitalize(id) : name,
              encodedValue: [actionType, id].join(this.delimiter),
              icon1: this.#getProficiencyIcon(skill.value),
              info1: (this.actor) ? { text: coreModule.api.Utils.getModifier(skill.total) } : "",
              listName: this.#getListName(actionType, name)
            };
          } catch(error) {
            coreModule.api.Logger.error(skill);
            return null;
          }
        })
        .filter(skill => !!skill);

      // Create group data
      const groupData = { id: "skills" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build spells
     */
    async #buildSpells() {
      const actionType = "spell";

      const spellsMap = new Map();

      // Loop through items
      for (const [key, value] of this.items) {
        const type = value.type;
        if (type === "spell") {
          const isUsableItem = this.#isUsableItem(value);
          const isUsableSpell = this.#isUsableSpell(value);
          if (isUsableItem && isUsableSpell) {
            const preparationMode = value.system.preparation.mode;
            switch (preparationMode) {
              case "atwill":
                if (!spellsMap.has("at-will-spells")) spellsMap.set("at-will-spells", new Map());
                spellsMap.get("at-will-spells").set(key, value);
                break;
              case "innate":
                if (!spellsMap.has("innate-spells")) spellsMap.set("innate-spells", new Map());
                spellsMap.get("innate-spells").set(key, value);
                break;
              case "pact":
                if (!spellsMap.has("pact-spells")) spellsMap.set("pact-spells", new Map());
                spellsMap.get("pact-spells").set(key, value);
                break;
              default:
              { const level = value.system.level;
                switch (level) {
                  case 0:
                    if (!spellsMap.has("cantrips")) spellsMap.set("cantrips", new Map());
                    spellsMap.get("cantrips").set(key, value);
                    break;
                  case 1:
                    if (!spellsMap.has("1st-level-spells")) spellsMap.set("1st-level-spells", new Map());
                    spellsMap.get("1st-level-spells").set(key, value);
                    break;
                  case 2:
                    if (!spellsMap.has("2nd-level-spells")) spellsMap.set("2nd-level-spells", new Map());
                    spellsMap.get("2nd-level-spells").set(key, value);
                    break;
                  case 3:
                    if (!spellsMap.has("3rd-level-spells")) spellsMap.set("3rd-level-spells", new Map());
                    spellsMap.get("3rd-level-spells").set(key, value);
                    break;
                  case 4:
                    if (!spellsMap.has("4th-level-spells")) spellsMap.set("4th-level-spells", new Map());
                    spellsMap.get("4th-level-spells").set(key, value);
                    break;
                  case 5:
                    if (!spellsMap.has("5th-level-spells")) spellsMap.set("5th-level-spells", new Map());
                    spellsMap.get("5th-level-spells").set(key, value);
                    break;
                  case 6:
                    if (!spellsMap.has("6th-level-spells")) spellsMap.set("6th-level-spells", new Map());
                    spellsMap.get("6th-level-spells").set(key, value);
                    break;
                  case 7:
                    if (!spellsMap.has("7th-level-spells")) spellsMap.set("7th-level-spells", new Map());
                    spellsMap.get("7th-level-spells").set(key, value);
                    break;
                  case 8:
                    if (!spellsMap.has("8th-level-spells")) spellsMap.set("8th-level-spells", new Map());
                    spellsMap.get("8th-level-spells").set(key, value);
                    break;
                  case 9:
                    if (!spellsMap.has("9th-level-spells")) spellsMap.set("9th-level-spells", new Map());
                    spellsMap.get("9th-level-spells").set(key, value);
                    break;
                }
              }
            }
          }
        }
      }

      // Reverse sort spell slots by level
      const systemSpells = Object.entries(this.actor.system.spells).reverse();

      // Set spell slot availability
      let pactSlot = null;
      const spellSlots = [];
      let spellSlotAvailable = this.showUnchargedItems;
      let pactSlotAvailable = this.showUnchargedItems;
      for (const [key, value] of systemSpells) {
        const hasValue = value.value > 0;
        const hasMax = value.max > 0;
        const hasLevel = value.level > 0;
        if (key === "pact") {
          if (!pactSlotAvailable && hasValue && hasMax && hasLevel) pactSlotAvailable = true;
          if (!hasLevel) pactSlotAvailable = false;
          value.slotAvailable = pactSlotAvailable;
          pactSlot = [key, value];
        }
        if (key.startsWith("spell") && key !== "spell0") {
          if (!spellSlotAvailable && hasValue && hasMax) spellSlotAvailable = true;
          value.slotAvailable = spellSlotAvailable;
          spellSlots.push([key, value]);
        } else if (hasValue) {
          value.slotsAvailable = true;
          spellSlots.push(key, value);
        }
      }

      // Set equivalent spell slot where pact slot is available
      if (pactSlot[1].slotAvailable) {
        const pactSpellEquivalent = spellSlots.findIndex(spell => spell[0] === `spell${pactSlot[1].level}`);
        spellSlots[pactSpellEquivalent][1].slotsAvailable = true;
      }

      const groupMappings = {
        "1st-level-spells": { spellMode: 1, name: game.i18n.localize("tokenActionHud.dnd5e.1stLevelSpells") },
        "2nd-level-spells": { spellMode: 2, name: game.i18n.localize("tokenActionHud.dnd5e.2ndLevelSpells") },
        "3rd-level-spells": { spellMode: 3, name: game.i18n.localize("tokenActionHud.dnd5e.3rdLevelSpells") },
        "4th-level-spells": { spellMode: 4, name: game.i18n.localize("tokenActionHud.dnd5e.4thLevelSpells") },
        "5th-level-spells": { spellMode: 5, name: game.i18n.localize("tokenActionHud.dnd5e.5thLevelSpells") },
        "6th-level-spells": { spellMode: 6, name: game.i18n.localize("tokenActionHud.dnd5e.6thLevelSpells") },
        "7th-level-spells": { spellMode: 7, name: game.i18n.localize("tokenActionHud.dnd5e.7thLevelSpells") },
        "8th-level-spells": { spellMode: 8, name: game.i18n.localize("tokenActionHud.dnd5e.8thLevelSpells") },
        "9th-level-spells": { spellMode: 9, name: game.i18n.localize("tokenActionHud.dnd5e.9thLevelSpells") },
        "at-will-spells": { spellMode: "atwill", name: game.i18n.localize("tokenActionHud.dnd5e.atWillSpells") },
        cantrips: { spellMode: 0, name: game.i18n.localize("tokenActionHud.dnd5e.cantrips") },
        "innate-spells": { spellMode: "innate", name: game.i18n.localize("tokenActionHud.dnd5e.innateSpells") },
        "pact-spells": { spellMode: "pact", name: game.i18n.localize("tokenActionHud.dnd5e.pactSpells") }
      };

      const spellSlotModes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "pact"];

      for (const groupId of SPELL_GROUP_IDS) {
        const spellMode = groupMappings[groupId].spellMode;
        const groupName = groupMappings[groupId].name;

        // Skip if no spells exist
        if (!spellsMap.has(groupId)) continue;

        const levelInfo = (spellMode === "pact") ? pactSlot[1] : spellSlots.find(spellSlot => spellSlot[0] === `spell${spellMode}`)?.[1];
        const slots = levelInfo?.value;
        const max = levelInfo?.max;
        const slotsAvailable = levelInfo?.slotAvailable;

        // Skip if spells require spell slots and none are available
        if (!slotsAvailable && spellSlotModes.includes(spellMode)) continue;

        // Create group data=
        const groupInfo = {};
        groupInfo.info1 = { class: "tah-spotlight", text: (max >= 0) ? `${slots}/${max}` : "" };
        const groupData = {
          id: groupId,
          name: groupName,
          info: groupInfo
        };

        // Add spell slot info to group
        this.addGroupInfo(groupData);

        const actionData = spellsMap.get(groupId);
        const data = { groupData, actionData, actionType };

        // Build actions
        await this.buildActions(data);

        // Build activations
        await this.buildActivations(data);
      }
    }

    /**
     * Build utility
     * @private
     */
    #buildUtility() {
      // Exit if every actor is not the character type
      if (this.actors.length === 0) return;
      if (!this.actors.every(actor => actor.type === "character")) return;

      const actionType = "utility";

      // Set utility types
      const utilityTypes = {
        deathSave: { name: game.i18n.localize("DND5E.DeathSave") },
        inspiration: { name: game.i18n.localize("DND5E.Inspiration") }
      };

      // Delete 'deathSave' for multiple tokens
      if (!this.actor || this.actor.system.attributes.hp.value > 0) delete utilityTypes.deathSave;

      // Get actions
      const actions = Object.entries(utilityTypes)
        .map(utilityType => {
          const id = utilityType[0];
          const name = utilityType[1].name;
          const encodedValue = [actionType, id].join(this.delimiter);
          let cssClass = "";
          if (utilityType[0] === "inspiration") {
            const active = this.actors.every(actor => actor.system.attributes?.inspiration)
              ? " active"
              : "";
            cssClass = `toggle${active}`;
          }
          return {
            id,
            name,
            encodedValue,
            cssClass,
            listName: this.#getListName(actionType, name)
          };
        });

      // Crreate group data
      const groupData = { id: "utility" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /**
     * Build actions
     * @public
     * @param {object} data actionData, groupData, actionType
     * @param {object} options
     */
    async buildActions(data, options) {
      const { actionData, groupData, actionType } = data;

      // Exit if there is no action data
      if (actionData.size === 0) return;

      // Exit if there is no groupId
      const groupId = (typeof groupData === "string" ? groupData : groupData?.id);
      if (!groupId) return;

      // Get actions
      const actions = await Promise.all([...actionData].map(async item => await this.#getAction(item[1], actionType)));

      // Add actions to action list
      this.addActions(actions, groupData);
    }

    /**
     * Get action
     * @private
     * @param {object} entity      The entity
     *  @param {string} actionType The action type
     * @returns {object}           The action
     */
    async #getAction(entity, actionType = "item") {
      const id = entity.id ?? entity._id;
      let name = entity?.name ?? entity?.label;
      let cssClass = "";
      if (Object.hasOwn(entity, "disabled")) {
        const active = (!entity.disabled) ? " active" : "";
        cssClass = `toggle${active}`;
      }
      const info = this.#getItemInfo(entity);
      const tooltip = await this.#getTooltip(await this.#getTooltipData(entity));
      return {
        id,
        name,
        encodedValue: [actionType, id].join(this.delimiter),
        cssClass,
        img: coreModule.api.Utils.getImage(entity),
        icon1: this.#getActivationTypeIcon(entity.system?.activities?.contents[0]?.type),
        icon2: this.#getPreparedIcon(entity),
        icon3: this.#getConcentrationIcon(entity),
        info1: info?.info1,
        info2: info?.info2,
        info3: info?.info3,
        listName: this.#getListName(actionType, name),
        tooltip
      };
    }

    /**
     * Is active item
     * @private
     * @param {object} item The item
     * @returns {boolean}   Whether the item is active
     */
    #isActiveItem(item) {
      if (this.showItemsWithoutActivationCosts) return true;
      const activationTypes = new Set(Object.keys(CONFIG.DND5E.activityActivationTypes).filter(activationType => activationType !== "none"));
      const activationType = item.system?.activities?.contents[0]?.activation?.type;
      return activationTypes.has(activationType) || item.type === "tool";
    }

    /**
     * Is equipped item
     * @private
     * @param {object} item The item
     * @returns {boolean}   Whether the item is equipped
     */
    #isEquippedItem(item) {
      const excludedTypes = ["consumable", "spell", "feat"];
      return (this.showUnequippedItems && !excludedTypes.includes(item.type))
      || (item.system.equipped && item.type !== "consumable");
    }

    /**
     * Is usable item
     * @private
     * @param {object} item The item
     * @returns {boolean}   Whether the item is usable
     */
    #isUsableItem(item) {
      return this.showUnchargedItems || item.system.uses;
    }

    /**
     * Is usable spell
     * @private
     * @param {object} spell The spell
     * @returns {boolean}    Whether the spell is usable
     */
    #isUsableSpell(spell) {
      if (this.actor?.type !== "character" && this.showUnequippedItems) return true;
      if (this.showUnpreparedSpells) return true;

      const preparationModes = new Set(Object.keys(CONFIG.DND5E.spellPreparationModes).filter(preparationMode => preparationMode !== "prepared"));

      // Return true if spell is a cantrip, has a preparation mode other than 'prepared' or is prepared
      return spell.system.level === 0 || preparationModes.has(spell.system.preparation.mode)
      || spell.system.preparation.prepared;
    }

    #getListName(actionType, actionName) {
      const prefix = `${game.i18n.localize(ACTION_TYPE[actionType])}: ` ?? "";
      return `${prefix}${actionName}` ?? "";
    }

    /**
     * Get item info
     * @private
     * @param {object} item
     * @returns {object}
     */
    #getItemInfo(item) {
      const info1 = item.type === "spell" ? this.#getSpellInfo(item) : this.#getQuantityData(item);
      const info2 = this.#getUsesData(item);
      const info3 = this.#getConsumeData(item);

      return { info1, info2, info3 };
    }

    /**
     * Add spell info
     * @private
     * @param {object} spell The spell
     * @returns {object}     The spell info
     */
    #getSpellInfo(spell) {
      if (!this.displaySpellInfo) return null;

      const components = spell.system?.properties;
      if (!components) return null;

      const info = { text: "", title: "" };
      const componentTypes = {
        vocal: "DND5E.ComponentVerbal",
        somatic: "DND5E.ComponentSomatic",
        material: "DND5E.ComponentMaterial"
      };


      const componentsArray = Object.entries(componentTypes)
        .filter(([key]) => components[key])
        .map(([key, label]) => {
          info.text += game.i18n.localize(`${label}Abbr`);
          return game.i18n.localize(label);
        });

      // Ritual
      if (components.ritual) {
        componentsArray.push(`[${game.i18n.localize("DND5E.Ritual")}]`);
        info.text += ` [${game.i18n.localize("DND5E.RitualAbbr")}]`;
      }

      info.title = componentsArray.join(", ");

      return info;
    }

    /**
     * Get valid actors
     * @private
     * @returns {object}
     */
    #getValidActors() {
      const allowedTypes = ["character", "npc"];
      return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.actors : [];
    }

    /**
     * Get valid tokens
     * @private
     * @returns {object}
     */
    #getValidTokens() {
      const allowedTypes = ["character", "npc"];
      return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.tokens : [];
    }

    /**
     * Get quantity
     * @private
     * @param {object} item
     * @returns {string}
     */
    #getQuantityData(item) {
      const quantity = item?.system?.quantity ?? 0;
      return {
        text: (quantity > 1) ? quantity : "",
        title: `${game.i18n.localize("DND5E.Quantity")}: ${quantity}`
      };
    }

    /**
     * Get uses
     * @private
     * @param {object} item
     * @param {string} consumeName
     * @param {integer} consumeAmount
     * @returns {string}
     */
    #getUsesData(item, consumeName, consumeAmount) {
      const uses = item?.system?.uses;
      if (uses?.per && (consumeName || uses?.prompt) && (uses.value > 0 || uses.max > 0)) {
        const of = game.i18n.localize("DND5E.of");
        const per = uses.per === "charges" ? "" : ` ${game.i18n.localize("DND5E.per")}`;
        const period = CONFIG.DND5E.limitedUsePeriods[uses.per]?.label ?? uses.per;
        const amount = consumeAmount !== undefined ? consumeAmount : uses.amount;
        const text = `${amount > 1 ? `${amount} ${of} ` : ""}${uses.value ?? "0"}${uses.max > 0 ? `/${uses.max}` : ""}`;
        const title = `${text}${per} ${period}${consumeName ? ` (${of} ${consumeName})` : ""}`;
        return { text, title };
      }
      return {};
    }

    /**
     * Get consume
     * @private
     * @param {object} item
     * @param {object} actor
     * @returns {string}
     */
    #getConsumeData(item) {
      // Get consume target and type
      const firstActivity = item?.system?.activities?.contents[0];
      const firstTarget = firstActivity?.consumption?.targets?.[0];
      const consumeId = firstTarget?.target;
      const consumeType = firstTarget?.type;
      const consumeAmount = firstTarget?.value;

      if (!consumeId || !consumeType || consumeId === item.id) return {};

      // Return resources
      if (consumeType === "attribute") {
        const parentId = consumeId.substr(0, consumeId.lastIndexOf("."));
        const target = foundry.utils.getProperty(this.actor.system, parentId);

        if (target) {
          const text = `${target.value ?? "0"}${target.max ? `/${target.max}` : ""}`;
          return {
            text,
            title: `${text} ${target.label ?? ""}`
          };
        }
      } else {
        const target = this.actor.items?.get(consumeId);

        // Return charges
        if (target && consumeType === "charges") {
          return this.#getUsesData(target, target.name, consumeAmount);
        }

        // Return quantity
        if (target?.system?.quantity) {
          const text = `${consumeAmount > 1 ? `${consumeAmount} ${game.i18n.localize("DND5E.of")} ` : ""}${target.system.quantity}`;
          return {
            text,
            title: `${text} ${target.name}`
          };
        }
      }

      return {};
    }

    /**
     * Discard slow items
     * @private
     * @param {Map} items The items
     * @returns {Map}     The filtered items
     */
    #discardSlowItems(items) {
      // Return all items if slow actions are allowed
      if (Utils.getSetting("showSlowActions")) return items;

      // Define slow activation types
      const slowActivationTypes = new Set(["minute", "hour", "day"]);

      // Filter out slow items and return the result
      return new Map([...items.entries()].filter(([_, item]) => {
        const activationType = item.system?.activation?.type;
        return !slowActivationTypes.has(activationType);
      }));
    }

    /**
     * Get proficiency icon
     * @param {string} level
     * @returns {string}
     */
    #getProficiencyIcon(level) {
      const title = CONFIG.DND5E.proficiencyLevels[level] ?? "";
      const icon = PROFICIENCY_LEVEL_ICON[level];
      return (icon) ? `<i class="${icon}" title="${title}"></i>` : "";
    }

    /**
     * Get icon for the activation type
     * @private
     * @param {object} activationType The activation type
     * @returns {string}              The icon
     */
    #getActivationTypeIcon(activationType) {
      const title = CONFIG.DND5E.abilityActivationTypes[activationType] ?? "";
      const icon = ACTIVATION_TYPE[activationType]?.icon;
      return (icon) ? `<i class="${icon}" title="${title}"></i>` : "";
    }

    /**
     * Get icon for concentration type
     * @private
     * @param {object} spell
     * @returns {string}
     */
    #getConcentrationIcon(spell) {
      if (spell?.type !== "spell" || !this.displaySpellInfo || !spell.system?.properties?.has("concentration")) return null;
      const title = game.i18n.localize("DND5E.Scroll.RequiresConcentration");
      const icon = CONCENTRATION_ICON;
      return `<dnd5e-icon src="${icon}" title="${title}">`;
    }

    /**
     * Get icon for a prepared spell
     * @private
     * @param {object} spell
     * @returns
     */
    #getPreparedIcon(spell) {
      if (spell?.type !== "spell" || !this.showUnpreparedSpells) return null;
      const level = spell.system.level;
      const preparationMode = spell.system.preparation.mode;
      const prepared = spell.system.preparation.prepared;
      const icon = prepared ? PREPARED_ICON : `${PREPARED_ICON} tah-icon-disabled`;
      const title = preparationMode === "always" ? game.i18n.localize("DND5E.SpellPrepAlways") : prepared ? game.i18n.localize("DND5E.SpellPrepared") : game.i18n.localize("DND5E.SpellUnprepared");

      // Return icon if the preparation mode is 'prepared' or 'always' and the spell is not a cantrip
      return ((preparationMode === "prepared" || preparationMode === "always") && level !== 0) ? `<i class="${icon}" title="${title}"></i>` : null;
    }

    async #getTooltipData(entity) {
      if (this.tooltipsSetting === "none") return "";

      const name = entity?.name ?? "";

      if (this.tooltipsSetting === "nameOnly") return name;

      const unidentified = entity.system?.identified === false;
      const description = (typeof entity?.system?.description === "string") ? entity?.system?.description : (unidentified ? entity?.system?.unidentified?.description : entity?.system?.description?.value) ?? "";
      let modifiers; let properties; let rarity; let traits;
      if (!unidentified) {
        modifiers = entity?.modifiers ?? null;
        properties = [
          ...entity.system?.chatProperties ?? [],
          ...entity.system?.equippableItemCardProperties ?? [],
          entity.system?.parent?.labels?.activation,
          entity.system?.parent?.labels?.target,
          entity.system?.parent?.labels?.range,
          entity.system?.parent?.labels?.duration
        ].filter(p => p);
        rarity = unidentified ? null : entity?.rarity ?? null;
        traits = (entity?.type === "weapon") ? this.#getWeaponProperties(entity?.system?.properties) : null;
      }
      return { name, description, modifiers, properties, rarity, traits };
    }

    /**
     * Get condition tooltip data
     * @param {*} id     The condition id
     * @param {*} name   The condition name
     * @returns {object} The tooltip data
     */
    async #getConditionTooltipData(id, name) {
      if (this.tooltipsSetting === "none") return "";

      const condition = CONFIG.DND5E.conditionTypes[id];

      if (this.tooltipsSetting === "nameOnly" || !condition) return name;

      const journalEntry = (condition.reference) ? await fromUuid(condition.reference) : null;
      const description = journalEntry?.text?.content ?? "";
      const relativeTo = journalEntry;
      return {
        name,
        description,
        relativeTo
      };
    }

    /**
     * Get tooltip
     * @param {object} tooltipData The tooltip data
     * @returns {string}           The tooltip
     */
    async #getTooltip(tooltipData) {
      if (this.tooltipsSetting === "none") return "";
      if (typeof tooltipData === "string") return tooltipData;

      const name = game.i18n.localize(tooltipData.name);

      if (this.tooltipsSetting === "nameOnly") return name;

      const nameHtml = `<h3>${name}</h3>`;

      const relativeTo = tooltipData.relativeTo ?? this.actor;

      const description = tooltipData?.descriptionLocalised
                ?? await TextEditor.enrichHTML(game.i18n.localize(tooltipData?.description ?? ""), { async: true, relativeTo, secrets: true });

      const rarityHtml = tooltipData?.rarity
        ? `<span class="tah-tag ${tooltipData.rarity}">${game.i18n.localize(RARITY[tooltipData.rarity])}</span>`
        : "";

      const propertiesHtml = tooltipData?.properties
        ? `<div class="tah-properties">${tooltipData.properties.map(property => `<span class="tah-property">${game.i18n.localize(property)}</span>`).join("")}</div>`
        : "";

      const traitsHtml = tooltipData?.traits
        ? tooltipData.traits.map(trait => `<span class="tah-tag">${game.i18n.localize(trait.label ?? trait)}</span>`).join("")
        : "";

      const traits2Html = tooltipData?.traits2
        ? tooltipData.traits2.map(trait => `<span class="tah-tag tah-tag-secondary">${game.i18n.localize(trait.label ?? trait)}</span>`).join("")
        : "";

      const traitsAltHtml = tooltipData?.traitsAlt
        ? tooltipData.traitsAlt.map(trait => `<span class="tah-tag tah-tag-alt">${game.i18n.localize(trait.label)}</span>`).join("")
        : "";

      const modifiersHtml = tooltipData?.modifiers
        ? `<div class="tah-tags">${tooltipData.modifiers.filter(modifier => modifier.enabled).map(modifier => {
          const label = game.i18n.localize(modifier.label);
          const sign = modifier.modifier >= 0 ? "+" : "";
          const mod = `${sign}${modifier.modifier ?? ""}`;
          return `<span class="tah-tag tah-tag-transparent">${label} ${mod}</span>`;
        }).join("")}</div>`
        : "";

      const tagsJoined = [rarityHtml, traitsHtml, traits2Html, traitsAltHtml].join("");

      const tagsHtml = (tagsJoined) ? `<div class="tah-tags">${tagsJoined}</div>` : "";

      const headerTags = (tagsHtml || modifiersHtml) ? `<div class="tah-tags-wrapper">${tagsHtml}${modifiersHtml}</div>` : "";

      if (!description && !tagsHtml && !modifiersHtml) return name;

      return `<div>${nameHtml}${headerTags}${description}${propertiesHtml}</div>`;
    }

    #getWeaponProperties(weaponProperties) {
      if (!weaponProperties) return null;
      return Object.entries(weaponProperties)
        .filter(([id, selected]) => selected && CONFIG.DND5E.validProperties.weapon.has(id))
        .map(([id, _]) => game.i18n.localize(CONFIG.DND5E.itemProperties[id]));
    }
  };
});
