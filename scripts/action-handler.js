// System Module Imports
import {
  ACTIVATION_TYPE, ACTION_TYPE, CONCENTRATION_ICON, CUSTOM_DND5E, FEATURE_GROUP_IDS,
  GROUP, PREPARED_ICON, PROFICIENCY_LEVEL_ICON, RARITY, SPELL_GROUP_IDS
} from "./constants.js";
import { Utils } from "./utils.js";

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    // Initialize action variables
    featureActions = null;

    inventoryActions = null;

    spellActions = null;

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Build abilities
     * @private
     * @param {string} actionType
     * @param {string} groupId
     */
    #buildAbilities(actionType, groupId) {
      // Get abilities and exit if none exist
      const abilities = this.actor?.system.abilities || CONFIG.DND5E.abilities;
      if (abilities.length === 0) return;

      // Get actions
      const actions = Object.entries(abilities)
        .filter(ability => abilities[ability[0]].value !== 0)
        .map(([abilityId, ability]) => {
          const name = CONFIG.DND5E.abilities[abilityId].label;
          // ability.save deprecated in dnd5e 4.3.
          const abilitySaveValue = ability?.save?.value ?? ability?.save;

          const mod = (groupId === "saves") ? abilitySaveValue : ability?.mod;
          return {
            id: `${actionType}-${abilityId}`,
            name: (this.abbreviateSkills) ? Utils.capitalize(abilityId) : name,
            icon1: (groupId !== "checks") ? this.#getProficiencyIcon(abilities[abilityId].proficient) : "",
            info1: (this.actor) ? {
              text: coreModule.api.Utils.getModifier(mod),
              title: `${game.i18n.localize("DND5E.ActionAbil")}: ${coreModule.api.Utils.getModifier(mod)}`
            } : null,
            info2: (this.actor && groupId === "abilities") ? {
              text: `(${coreModule.api.Utils.getModifier(abilitySaveValue)})`,
              title: `${game.i18n.localize("DND5E.SavingThrow")}: ${coreModule.api.Utils.getModifier(abilitySaveValue)}`
            } : null,
            listName: this.#getListName(actionType, name),
            system: { actionType, actionId: abilityId }
          };
        });

      // Add actions to action list
      this.addActions(actions, { id: groupId });
    }

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Build combat
     * @private
     */
    #buildCombat() {
      // If token's turn, include endTurn
      const combatType = {
        initiative: "tokenActionHud.dnd5e.rollInitiative",
        ...(game.combat?.current?.tokenId === this.token?.id && { endTurn: "tokenActionHud.endTurn" })
      };

      const tokens = coreModule.api.Utils.getControlledTokens();
      const tokenIds = tokens?.map(token => token.id);
      const combatants = (game.combat)
        ? game.combat.combatants.filter(combatant => tokenIds.includes(combatant.tokenId))
        : [];

      const getInfo1 = id => {
        if (id === "initiative" && combatants.length === 1) {
          const currentInitiative = combatants[0].initiative;
          return { class: "tah-spotlight", text: currentInitiative };
        }
        return {};
      };

      const getActive = () => { return combatants.length > 0 && (combatants.every(combatant => combatant?.initiative)) ? " active" : "";};

      // Get actions
      const actionType = "utility";
      const actions = Object.entries(combatType).map(([id, name]) => {
        return {
          id,
          name: game.i18n.localize(name),
          info1: getInfo1(id),
          cssClass: (id === "initiative" ) ? `toggle${getActive()}` : "",
          listName: this.#getListName(actionType, name),
          system: { actionType, actionId: id }
        };
      });

      // Add actions to HUD
      this.addActions(actions, { id: "combat" });
    }

    /* -------------------------------------------- */

    /**
     * Build conditions
     * @private
     */
    async #buildConditions() {
      if (this.tokens?.length === 0) return;

      // Get conditions and exit if none exist
      const conditions = CONFIG.statusEffects.filter(condition => condition.id !== "");
      if (conditions.length === 0) return;

      // Get actions
      const actionType = "condition";
      const actions = await Promise.all(conditions.map(async condition => {
        const hasCondition = this.actors.every(actor => {
          return actor.effects.some(effect => effect.statuses.some(status => status === condition.id)
          && !effect?.disabled);
        });
        const name = game.i18n.localize(condition.label) ?? condition.name;
        return {
          id: condition.id,
          name,
          img: coreModule.api.Utils.getImage(condition),
          cssClass: `toggle${(hasCondition) ? " active" : ""}`,
          listName: this.#getListName(actionType, name),
          tooltip: this.#getConditionTooltipData(condition.id, condition.name),
          system: { actionType, actionId: condition.id }
        };
      }));

      // Add actions to HUD
      this.addActions(actions, { id: "conditions" });
    }

    /* -------------------------------------------- */

    /**
     * Build counters
     * @private
     */
    async #buildCounters() {
      if (!coreModule.api.Utils.isModuleActive(CUSTOM_DND5E.ID)
        || !CUSTOM_DND5E.COUNTERS[this.actor?.type]) return;

      const actionType = "counter";

      let counters = game.settings.get(CUSTOM_DND5E.ID, CUSTOM_DND5E.COUNTERS[this.actor?.type]) ?? {};

      if (coreModule.api.Utils.isModuleActive(CUSTOM_DND5E.ID) && Object.keys(counters).length) {
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
            case "fraction":
              active = (value.value > 0) ? " active" : "";
              cssClass = `toggle${active}`;
              info1 = { text: `${value.value ?? 0}/${value.max ?? 0}` };
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
          name: counter.label,
          listName: this.#getListName(actionType, counter.name),
          cssClass,
          img,
          info1,
          system: { actionType, counterKey: counter.key, counterType: counter.type}
        };
      });

      // Add actions to HUD
      this.addActions(actions, { id: "counters" });
    }

    /* -------------------------------------------- */

    /**
     * Build effects
     * @private
     */
    async #buildEffects() {
      const actionType = "effect";

      // Get effects and exit if none exist
      const effects = new Map(this.actor.allApplicableEffects().map(effect => [effect.id, effect]));
      if (effects.size === 0) return;

      // Map passive and temporary effects to new maps
      const passiveEffects = new Map();
      const temporaryEffects = new Map();
      const statusEffectIds = new Set(CONFIG.statusEffects.map(statusEffect => statusEffect._id));

      // Iterate effects and add to a map based on the isTemporary value
      for (const [effectId, effect] of effects.entries()) {
        if (effect.isSuppressed) continue;
        if (effect.parent?.system?.identified === false && !game.user.isGM) continue;
        if (statusEffectIds.has(effect.id)) continue;

        if (effect.isTemporary) { temporaryEffects.set(effectId, effect); }
        else { passiveEffects.set(effectId, effect); }
      }

      // Build passive and temporary effects
      await Promise.all([
        this.buildActions({ groupData: { id: "passive-effects" }, actionData: passiveEffects, actionType }),
        this.buildActions({ groupData: { id: "temporary-effects" }, actionData: temporaryEffects, actionType })
      ]);
    }

    /* -------------------------------------------- */

    /**
     * Build exhaustion
     * @private
     */
    #buildExhaustion() {
      // Exit if every actor is not the character type
      if (!this.actors.every(actor => actor.type === "character")) return;

      // Get actions
      const actionType = "exhaustion";
      const active = this.actor.system.attributes.exhaustion > 0 ? " active" : "";
      const actions = [{
        id: "exhaustion",
        name: game.i18n.localize("DND5E.Exhaustion"),
        cssClass: `toggle${active}`,
        img: coreModule.api.Utils.getImage("modules/token-action-hud-dnd5e/icons/exhaustion.svg"),
        info1: { text: this.actor.system.attributes.exhaustion },
        listName: this.#getListName(actionType, name),
        system: { actionType, actionId: "exhaustion" }
      }];

      // Add actions to HUD
      this.addActions(actions, { id: "exhaustion" });
    }

    /* -------------------------------------------- */

    /**
     * Build features
     * @private
     */
    async #buildFeatures() {
      // Filter feats from items and exit if none exist
      const feats = new Map([...this.items].filter(([, value]) => value.type === "feat"));
      if (feats.size === 0) return;

      // Map active and passive features to new maps
      const featuresMap = new Map([
        ["activeFeatures", new Map()],
        ["passiveFeatures", new Map()]
      ]);

      const featureType = {
        background: "backgroundFeatures",
        class: "classFeatures",
        monster: "monsterFeatures",
        race: "raceFeatures",
        feats: "feats"
      };

      const classFeatureType = {
        artificerInfusion: "artificerInfusions",
        channelDivinity: "channelDivinity",
        defensiveTactic: "defensiveTactics",
        eldritchInvocation: "eldritchInvocations",
        elementalDiscipline: "elementalDisciplines",
        fightingStyle: "fightingStyles",
        huntersPrey: "huntersPrey",
        ki: "kiAbilities",
        maneuver: "maneuvers",
        metamagic: "metamagicOptions",
        multiattack: "multiattacks",
        pact: "pactBoons",
        psionicPower: "psionicPowers",
        rune: "runes",
        superiorHuntersDefense: "superiorHuntersDefense"
      };

      for (const [key, value] of feats) {
        const activationType = value.system.activities.contents[0]?.type;
        const type = value.system.type.value;
        const subType = value.system.type?.subtype;

        if (activationType) { featuresMap.get("activeFeatures").set(key, value); }
        else { featuresMap.get("passiveFeatures").set(key, value); }

        // Map feature types
        if (featureType[type]) {
          if (!featuresMap.has(featureType[type])) featuresMap.set(featureType[type], new Map());
          featuresMap.get(featureType[type]).set(key, value);
        }

        // Map class feature subtypes
        if (classFeatureType[subType]) {
          if (!featuresMap.has(classFeatureType[subType])) featuresMap.set(classFeatureType[subType], new Map());
          featuresMap.get(classFeatureType[subType]).set(key, value);
        }
      }

      // Loop through inventory groups ids
      for (const id of FEATURE_GROUP_IDS) {
        const actionData = featuresMap.get(id);
        if (!actionData || actionData.size === 0) continue;

        // Create group data
        const groupData = {
          id: GROUP[id].id,
          name: game.i18n.localize(GROUP[id].name) ?? ""
        };

        // Build actions and activations
        const actionType = "feature";
        await this.buildActions({ groupData, actionData, actionType });
        await this.buildActivations({ groupData, actionData, actionType });
      }
    }

    /* -------------------------------------------- */

    /**
     * Build inventory
     * @private
     */
    async #buildInventory() {
      // Exit early if no items exist
      if (this.items.size === 0) return;

      // Initialize inventory map categories
      const inventoryMap = new Map([
        ["equipped", new Map()],
        ["unequipped", new Map()],
        ["consumables", new Map()],
        ["containers", new Map()],
        ["equipment", new Map()],
        ["loot", new Map()],
        ["tools", new Map()],
        ["weapons", new Map()]
      ]);

      for (const [key, value] of this.items) {
        // Set items into maps
        if (value.system?.quantity > 0 && this.#isActiveItem(value)) {
          if (value.system.equipped) { inventoryMap.get("equipped").set(key, value); }
          else { inventoryMap.get("unequipped").set(key, value); }

          if (this.#isUsableItem(value) && value.type === "consumable") inventoryMap.get("consumables").set(key, value);
          if (this.#isEquippedItem(value)) {
            switch (value.type) {
              case "container": inventoryMap.get("containers").set(key, value); break;
              case "equipment": inventoryMap.get("equipment").set(key, value); break;
              case "loot": inventoryMap.get("loot").set(key, value); break;
              case "tool": inventoryMap.get("tools").set(key, value); break;
              case "weapon": inventoryMap.get("weapons").set(key, value); break;
            }
          }
        }
      }

      // Loop through inventory subcateogry ids
      for (const groupId of this.inventorygroupIds) {
        const actionData = inventoryMap.get(groupId);
        if (!actionData || actionData.size === 0) continue;

        // Create group data
        const groupData = {
          id: groupId,
          name: game.i18n.localize(GROUP[groupId].name)
        };

        const data = { groupData, actionData };

        // Build actions and activations
        await this.buildActions(data);
        await this.buildActivations(data);
      }
    }

    /* -------------------------------------------- */

    /**
     * Build rests
     * @private
     */
    #buildRests() {
      // Exit if every actor is not the character type
      if (this.actors.length === 0 || !this.actors.every(actor => actor.type === "character")) return;

      // Get actions
      const actionType = "utility";
      const restTypes = { shortRest: "DND5E.REST.Short.Label", longRest: "DND5E.REST.Long.Label" };
      const actions = Object.entries(restTypes).map(([id, name]) => {
        name = game.i18n.localize(name);
        return {
          id,
          name,
          listName: this.#getListName(actionType, name),
          system: { actionType, actionId: id }
        };
      });

      // Add actions to HUD
      this.addActions(actions, { id: "rests" });
    }

    /* -------------------------------------------- */

    /**
     * Build skills
     * @private
     */
    #buildSkills() {
      // Get skills and exit if none exist
      const skills = this.actor?.system.skills || CONFIG.DND5E.skills;
      if (skills.length === 0) return;

      // Get actions
      const actionType = "skill";
      const actions = Object.entries(skills).map(([id, skill]) => {
        try {
          const name = CONFIG.DND5E.skills[id].label;
          return {
            id,
            name: this.abbreviateSkills ? Utils.capitalize(id) : name,
            icon1: this.#getProficiencyIcon(skill.value),
            info1: (this.actor) ? { text: coreModule.api.Utils.getModifier(skill.total) } : "",
            listName: this.#getListName(actionType, name),
            system: { actionType, actionId: id }
          };
        } catch(error) {
          coreModule.api.Logger.error(skill);
          return null;
        }
      }).filter(skill => !!skill);

      // Add actions to HUD
      this.addActions(actions, { id: "skills" });
    }

    /* -------------------------------------------- */

    /**
     * Build spells
     */
    async #buildSpells() {
      // Filter items for spells and exit if none exist
      const spells = new Map([...this.items].filter(([, value]) => value.type === "spell"));
      if (spells.size === 0) return;

      // Initialize spells map categories
      const spellsMap = new Map([
        ["atWillSpells", new Map()],
        ["innateSpells", new Map()],
        ["pactSpells", new Map()],
        ["cantrips", new Map()],
        ["_1stLevelSpells", new Map()],
        ["_2ndLevelSpells", new Map()],
        ["_3rdLevelSpells", new Map()],
        ["_4thLevelSpells", new Map()],
        ["_5thLevelSpells", new Map()],
        ["_6thLevelSpells", new Map()],
        ["_7thLevelSpells", new Map()],
        ["_8thLevelSpells", new Map()],
        ["_9thLevelSpells", new Map()],
        ["additionalSpells", new Map()]
      ]);

      // Loop through items
      for (const [key, value] of spells) {
        if (!this.#isUsableItem(value) || !this.#isUsableSpell(value)) continue;

        if (value.system.linkedActivity) {
          if (value.system.linkedActivity.displayInSpellbook) {
            spellsMap.get("additionalSpells").set(key, value);
          }
        } else {
          switch (value.system.method) {
            case "atwill":
              spellsMap.get("atWillSpells").set(key, value); break;
            case "innate":
              spellsMap.get("innateSpells").set(key, value); break;
            case "pact":
              spellsMap.get("pactSpells").set(key, value); break;
            default: {
              switch (value.system.level) {
                case 0:
                  spellsMap.get("cantrips").set(key, value); break;
                case 1:
                  spellsMap.get("_1stLevelSpells").set(key, value); break;
                case 2:
                  spellsMap.get("_2ndLevelSpells").set(key, value); break;
                case 3:
                  spellsMap.get("_3rdLevelSpells").set(key, value); break;
                case 4:
                  spellsMap.get("_4thLevelSpells").set(key, value); break;
                case 5:
                  spellsMap.get("_5thLevelSpells").set(key, value); break;
                case 6:
                  spellsMap.get("_6thLevelSpells").set(key, value); break;
                case 7:
                  spellsMap.get("_7thLevelSpells").set(key, value); break;
                case 8:
                  spellsMap.get("_8thLevelSpells").set(key, value); break;
                case 9:
                  spellsMap.get("_9thLevelSpells").set(key, value); break;
              }
            }
          }
        }
      }

      // Reverse sort spell slots by level
      const systemSpells = Object.entries(this.actor.system.spells).reverse();

      // Set spell slot availability
      const spellSlotsMap = new Map();
      let spellSlotAvailable = this.showUnchargedItems;
      let pactSlotAvailable = this.showUnchargedItems;
      let pactSlot = null;

      for (const [key, value] of systemSpells) {
        const hasValue = value.value > 0;
        const hasMax = value.max > 0;
        const hasLevel = value.level > 0;

        if (key === "pact") {
          pactSlotAvailable = pactSlotAvailable || (hasValue && hasMax && hasLevel);
          value.slotAvailable = pactSlotAvailable && hasLevel;
          pactSlot = [key, value];
        } else if (key.startsWith("spell") && key !== "spell0") {
          spellSlotAvailable = spellSlotAvailable || (hasValue && hasMax);
          value.slotAvailable = spellSlotAvailable;
          spellSlotsMap.set(key, value);
        } else if (hasValue) {
          value.slotsAvailable = true;
          spellSlotsMap.set(key, value);
        }
      }

      // Set equivalent spell slot where pact slot is available
      if (pactSlot[1].slotAvailable) {
        const spellSlot = spellSlotsMap.get(`spell${pactSlot[1].level}`);
        spellSlot.slotsAvailable = true;
      }

      const spellSlotModes = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, "pact"]);

      for (const id of SPELL_GROUP_IDS) {
        // Skip if no spells exist
        if (!spellsMap.has(id)) continue;

        const spellMode = GROUP[id].spellMode;
        const levelInfo = (spellMode === "pact") ? pactSlot[1] : spellSlotsMap.get(`spell${spellMode}`);
        const { value: slots = 0, max = 0, slotAvailable = false } = levelInfo || {};

        // Skip if spells require spell slots and none are available
        if (!slotAvailable && spellSlotModes.has(spellMode)) continue;

        // Create group data
        const groupData = {
          id: GROUP[id].id,
          name: game.i18n.localize(GROUP[id].name),
          info: { info1: { class: "tah-spotlight", text: (max > 0) ? `${slots}/${max}` : "" } }
        };

        // Add spell slot info to group
        this.addGroupInfo(groupData);

        const data = { groupData, actionData: spellsMap.get(id), actionType: "spell" };

        // Build actions and activations
        await this.buildActions(data);
        await this.buildActivations(data);
      }
    }

    /* -------------------------------------------- */

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
            cssClass,
            listName: this.#getListName(actionType, name),
            system: { actionType, actionId: id }
          };
        });

      // Crreate group data
      const groupData = { id: "utility" };

      // Add actions to HUD
      this.addActions(actions, groupData);
    }

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Get action
     * @private
     * @param {object} entity      The entity
     * @param {string} actionType The action type
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
      const tooltip = this.#getTooltipData(entity);
      return {
        id,
        name,
        cssClass,
        img: coreModule.api.Utils.getImage(entity),
        icon1: this.#getActivationTypeIcon(entity.system?.activities?.contents[0]?.activation.type),
        icon2: this.#getPreparedIcon(entity),
        icon3: this.#getConcentrationIcon(entity),
        info1: info?.info1,
        info2: info?.info2,
        info3: info?.info3,
        listName: this.#getListName(actionType, name),
        tooltip,
        system: { actionType, actionId: id }
      };
    }

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Is usable item
     * @private
     * @param {object} item The item
     * @returns {boolean}   Whether the item is usable
     */
    #isUsableItem(item) {
      return this.showUnchargedItems || !!item.system.uses?.value || !item.system.uses?.max;
    }

    /* -------------------------------------------- */

    /**
     * Is usable spell
     * @private
     * @param {object} spell The spell
     * @returns {boolean}    Whether the spell is usable
     */
    #isUsableSpell(spell) {
      if (this.actor?.type !== "character" && this.showUnequippedItems) return true;
      if (this.showUnpreparedSpells) return true;

      // Return true if the spell has a spellcasting method other than 'spell' (which maps to 'prepared') or is prepared
      return (spell.system.method !== "spell")
        || spell.system.prepared || spell.system.linkedActivity?.displayInSpellbook;
    }

    /* -------------------------------------------- */

    #getListName(actionType, actionName) {
      const prefix = `${game.i18n.localize(ACTION_TYPE[actionType])}: ` ?? "";
      return `${prefix}${actionName}` ?? "";
    }

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Get valid actors
     * @private
     * @returns {object}
     */
    #getValidActors() {
      const allowedTypes = ["character", "npc"];
      return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.actors : [];
    }

    /* -------------------------------------------- */

    /**
     * Get valid tokens
     * @private
     * @returns {object}
     */
    #getValidTokens() {
      const allowedTypes = ["character", "npc"];
      return this.actors.every(actor => allowedTypes.includes(actor.type)) ? this.tokens : [];
    }

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Get uses
     * @private
     * @param {object} item
     * @returns {string}
     */
    #getUsesData(item) {
      const uses = item?.system?.uses;
      if (!(uses?.max > 0)) return {};
      const per = uses.recovery[0]?.period === "charges" ? "" : ` ${game.i18n.localize("DND5E.per")} `;
      const period = CONFIG.DND5E.limitedUsePeriods[uses.recovery[0]?.period]?.label ?? uses.recovery[0]?.period;
      const perPeriod = (period) ? `${per}${period}` : "";
      const remainingUses = uses.max - (uses.spent ?? 0);
      const text = `${remainingUses}/${uses.max}`;
      const title = `${text}${perPeriod}`;
      return { text, title };
    }

    /* -------------------------------------------- */

    /**
     * Get consume
     * @private
     * @param {object} item
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
          return this.#getUsesData(target);
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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

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

    /* -------------------------------------------- */

    /**
     * Get icon for concentration type
     * @private
     * @param {object} spell The spell
     * @returns {string}     The icon
     */
    #getConcentrationIcon(spell) {
      if (spell?.type !== "spell" || !this.displaySpellInfo || !spell.system?.properties?.has("concentration")) return null;
      const title = game.i18n.localize("DND5E.Scroll.RequiresConcentration");
      const icon = CONCENTRATION_ICON;
      return `<dnd5e-icon src="${icon}" title="${title}">`;
    }

    /* -------------------------------------------- */

    /**
     * Get icon for a prepared spell
     * @private
     * @param {object} spell The spell
     * @returns {string}     The icon
     */
    #getPreparedIcon(spell) {
      if (spell?.type !== "spell" || !this.showUnpreparedSpells) return null;
      const level = spell.system.level;
      const preparationMode = spell.system.method;
      const prepared = spell.system.prepared;
      const icon = prepared ? PREPARED_ICON : `${PREPARED_ICON} tah-icon-disabled`;
      const title = prepared === CONFIG.DND5E.spellPreparationStates.always.value ? game.i18n.localize("DND5E.SpellPrepAlways") : prepared ? game.i18n.localize("DND5E.SpellPrepared") : game.i18n.localize("DND5E.SpellUnprepared");

      // Return icon if the spellcasting method is 'spell' (prepared) or prepared is always and the spell is not a cantrip
      return ((preparationMode === "spell" || prepared === CONFIG.DND5E.spellPreparationStates.always.value) && level !== 0) ? `<i class="${icon}" title="${title}"></i>` : null;
    }

    /* -------------------------------------------- */

    #getTooltipData(entity) {
      if (this.tooltipsSetting === "none") return "";

      const name = entity?.name ?? "";

      if (this.tooltipsSetting === "nameOnly") return name;

      const tooltip = {};
      tooltip.content = `<section class="loading" data-uuid="${entity.uuid}"><i class="fas fa-spinner fa-spin-pulse"></i></section>`;
      tooltip.class = "dnd5e2 dnd5e-tooltip item-tooltip";

      return tooltip;
    }

    /* -------------------------------------------- */

    /**
     * Get condition tooltip data
     * @param {*} id     The condition id
     * @param {*} name   The condition name
     * @returns {object} The tooltip data
     */
    #getConditionTooltipData(id, name) {
      if (this.tooltipsSetting === "none") return "";

      const condition = CONFIG.DND5E.conditionTypes[id];

      if (this.tooltipsSetting === "nameOnly" || !condition?.reference) return name;

      const tooltip = {};
      tooltip.content = `<section class="loading" data-uuid="${condition.reference}"><i class="fas fa-spinner fa-spin-pulse"></i></section>`;
      tooltip.class = "dnd5e2 dnd5e-tooltip rule-tooltip";

      return tooltip;
    }
  };
});
