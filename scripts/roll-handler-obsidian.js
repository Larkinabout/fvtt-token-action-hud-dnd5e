import { RollHandler } from "./roll-handler.js";

export class RollHandlerObsidian extends RollHandler {
  /**
   * Roll Ability Test
   * @override
   * @param {object} event
   * @param {string} actionId
   */
  _rollAbilityTest(event, actionId) {
    OBSIDIAN.Items.roll(super.actor, { roll: "abl", abl: actionId });
  }

  /**
   * Roll Ability Save
   * @override
   * @param {object} event
   * @param {string} actorId
   * @param {string} tokenId
   * @param {string} actionId
   */
  _rollAbilitySave(event, actionId) {
    OBSIDIAN.Items.roll(super.actor, { roll: "save", save: actionId });
  }

  /**
   * Roll Skill
   * @override
   * @param {object} event
   * @param {string} actionId
   */
  _rollSkill(event, actionId) {
    OBSIDIAN.Items.roll(super.actor, { roll: "skl", skl: actionId });
  }

  /**
   * Use Item
   * @override
   * @param {object} event
   * @param {string} actionId
   */
  _useItem(event, actionId) {
    OBSIDIAN.Items.roll(super.actor, { roll: "item", id: actionId });
  }
}
