import { CUSTOM_DND5E } from "./constants.js";

export let RollHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  RollHandler = class RollHandler extends coreModule.api.RollHandler {
    /**
     * Handle action click
     * @override
     * @param {object} event
     */
    async handleActionClick(event) {
      const { actionType, actionId } = this.action.system;

      if (!this.actor) {
        for (const token of coreModule.api.Utils.getControlledTokens()) {
          const actor = token.actor;
          await this.handleAction(event, actionType, actor, token, actionId);
        }
      } else {
        await this.handleAction(event, actionType, this.actor, this.token, actionId);
      }
    }

    /**
     * Handle action
     * @private
     * @param {object} event
     * @param {string} actionType
     * @param {object} actor
     * @param {object} token
     * @param {string} actionId
     */
    async handleAction(event, actionType, actor, token, actionId) {
      switch (actionType) {
        case "ability":
          this.rollAbility(actor, actionId); break;
        case "check":
          this.rollAbilityTest(event, actor, actionId); break;
        case "save":
          this.rollAbilitySave(event, actor, actionId); break;
        case "condition":
          if (!token) return;
          await this.toggleCondition(actor, token, actionId); break;
        case "counter":
          await this.modifyCounter(event, actor); break;
        case "effect":
          await this.toggleEffect(actor, actionId); break;
        case "exhaustion":
          await this.modifyExhaustion(event, actor); break;
        case "feature":
        case "item":
        case "spell":
        case "weapon":
          if (this.isRenderItem()) this.renderItem(actor, actionId);
          else this.useItem(event, actor, actionId);
          break;
        case "magicItem":
          await this.rollMagicItem(actor, actionId); break;
        case "skill":
          this.rollSkill(actor, actionId); break;
        case "utility":
          await this.performUtilityAction(event, actor, token, actionId); break;
        default:
          break;
      }
    }

    /**
     * Modify Counter
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     */
    async modifyCounter(event, actor) {
      switch (this.action?.system?.counterKey) {
        case "death-saves":
          this.rollDeathSave(event, actor); break;
        case "exhaustion":
          await this.modifyExhaustion(actor); break;
        case "inspiration":
          await this.modifyInspiration(actor); break;
        default:
          await this.modifyCustomCounter(actor); break;
      }
    }

    /**
     * Modify Exhaustion
     * @private
     * @param {object} actor The actor
     */
    async modifyExhaustion(actor) {
      const currentExhaustion = actor.system.attributes.exhaustion;
      const newExhaustion = currentExhaustion + (this.isRightClick ? -1 : 1);
      if (newExhaustion >= 0 && newExhaustion !== currentExhaustion) {
        actor.update({ "system.attributes.exhaustion": newExhaustion });
      }
    }

    /**
     * Modify Inspiration
     * @private
     * @param {object} actor The actor
     */
    async modifyInspiration(actor) {
      const update = !actor.system.attributes.inspiration;
      actor.update({ "system.attributes.inspiration": update });
    }

    /**
     * Modify Custom Counter
     * @private
     * @param {object} actor The actor
     */
    async modifyCustomCounter(actor) {
      const { counterKey, counterType } = this.action.system;

      let value = actor.getFlag(CUSTOM_DND5E.ID, counterKey) || {};

      const setFlag = async (key, currentValue, newValue) => {
        if (newValue !== currentValue) {
          await actor.setFlag(CUSTOM_DND5E.ID, key, newValue);
        }
      };

      const adjustValue = (key, currentValue = 0, increment = 1) => {
        const newValue = this.isRightClick ? Math.max(0, currentValue - increment) : currentValue + increment;
        setFlag(key, currentValue, newValue);
      };

      switch (counterType) {
        case "checkbox":
          await setFlag(id, !value);
          break;

        case "fraction":
          if (this.isRightClick || (value.max && value.value < value.max) || !value.max) {
            adjustValue(`${id}.value`, value.value);
          }
          break;

        case "number":
          adjustValue(id, value);
          break;

        case "successFailure":
          value.success = value?.success ?? 0;
          value.failure = value?.failure ?? 0;
          if (this.isCtrl) {
            adjustValue(`${id}.failure`, value.failure);
          } else {
            adjustValue(`${id}.success`, value.success);
          }
      }
    }

    /**
     * Roll Ability
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    rollAbility(actor, actionId) {
      if (!actor.system?.abilities) return;
      actor.rollAbility({ ability: actionId });
    }

    /**
     * Roll Ability Save
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    rollAbilitySave(event, actor, actionId) {
      if (!actor.system?.abilities) return;
      actor.rollAbilitySave(actionId, { event });
    }

    /**
     * Roll Ability Test
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    rollAbilityTest(event, actor, actionId) {
      if (!actor.system?.abilities) return;
      actor.rollAbilityTest(actionId, { event });
    }

    /**
     * Roll Death Save
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     */
    rollDeathSave(event, actor) {
      actor.rollDeathSave({ event });
    }

    /**
     * Roll Magic Item
     * @private
     * @param {object} actor    The actor
     */
    async rollMagicItem(actor) {
      const { itemId, effectId } = this.action.system;

      const magicItemActor = await MagicItems.actor(actor.id);
      if (!magicItemActor) return;

      // Magicitems module 3.0.0 does not support Item5e#use
      magicItemActor.roll(itemId, effectId);
      Hooks.callAll("forceUpdateTokenActionHud");
    }

    /**
     * Roll Skill
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    rollSkill(actor, actionId) {
      if (!actor.system?.skills) return;
      actor.rollSkill({ skill: actionId });
    }

    /**
     * Use Item
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    useItem(event, actor, actionId) {
      const item = coreModule.api.Utils.getItem(actor, actionId);

      if (this.#needsRecharge(item)) {
        item.rollRecharge();
      } else {
        item.use({ event, legacy: false });
      }
    }

    /**
     * Needs Recharge
     * @private
     * @param {object} item
     * @returns {boolean}
     */
    #needsRecharge(item) {
      return (item?.system?.uses?.period === "recharge" && !(item?.system?.uses?.value > 0));
    }

    /**
     * Perform utility action
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {object} token    The token
     * @param {string} actionId The action id
     */
    async performUtilityAction(event, actor, token, actionId) {
      switch (actionId) {
        case "deathSave":
          this.rollDeathSave(event, actor); break;
        case "endTurn":
          if (!token || game.combat?.current?.tokenId !== token.id) break;
          await game.combat?.nextTurn(); break;
        case "initiative":
          await this.rollInitiative(actor); break;
        case "inspiration":
          await this.modifyInspiration(actor); break;
        case "longRest":
          actor.longRest(); break;
        case "shortRest":
          actor.shortRest(); break;
      }

      // Update HUD
      Hooks.callAll("forceUpdateTokenActionHud");
    }

    /**
     * Roll Initiative
     * @param {object} actor The actor
     * @private
     */
    async rollInitiative(actor) {
      if (!actor) return;
      await actor.rollInitiative({ createCombatants: true });
      Hooks.callAll("forceUpdateTokenActionHud");
    }

    /**
     * Toggle Condition
     * @private
     * @param {object} actor    The actor
     * @param {object} token    The token
     * @param {string} actionId The action id
     */
    async toggleCondition(actor, token, actionId) {
      if (!token) return;

      const statusEffect = CONFIG.statusEffects.find(statusEffect => statusEffect.id === actionId);
      const isConvenient = statusEffect?.flags?.["dfreds-convenient-effects"]?.isConvenient
        ?? actionId.startsWith("Convenient Effect");

      if (game.dfreds && isConvenient) {
        const effectName = statusEffect.name ?? statusEffect.label;
        await game.dfreds.effectInterface.toggleEffect(effectName, { overlay: !!this.isRightClick });
      } else {
        const condition = this.#findCondition(actionId);
        if (!condition) return;

        const effect = this.#findEffect(actor, actionId);
        if (effect?.disabled) { await effect.delete(); }

        await actor.toggleStatusEffect(condition.id, { overlay: !!this.isRightClick });
      }

      Hooks.callAll("forceUpdateTokenActionHud");
    }

    /**
     * Find condition
     * @private
     * @param {string} actionId The action id
     * @returns {object}        The condition
     */
    #findCondition(actionId) {
      return CONFIG.statusEffects.find(effect => effect.id === actionId);
    }

    /**
     * Find effect
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     * @returns {object}        The effect
     */
    #findEffect(actor, actionId) {
      return actor.effects.find(effect => effect.statuses.every(status => status === actionId));
    }

    /**
     * Toggle Effect
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    async toggleEffect(actor, actionId) {
      const effect = actor.allApplicableEffects().find(effect => effect.id === actionId);
      if (!effect) return;

      if (this.isRightClick && !effect.transfer) {
        await effect.delete();
      } else {
        await effect.update({ disabled: !effect.disabled });
      }

      Hooks.callAll("forceUpdateTokenActionHud");
    }

    /**
     * Handle action hover
     * @override
     * @param {object} event
     */
    async handleActionHover(event) {
      const types = ["feature", "item", "spell", "weapon", "magicItem"];

      if (!this.actor || !this.action?.system?.actionId) return;

      const { actionType, actionId } = this.action.system;

      if (!types.includes(actionType)) return;

      const item = coreModule.api.Utils.getItem(this.actor, actionId);

      if (this.isHover) {
        Hooks.call("tokenActionHudSystemActionHoverOn", event, item);
      } else {
        Hooks.call("tokenActionHudSystemActionHoverOff", event, item);
      }
    }
  };
});
