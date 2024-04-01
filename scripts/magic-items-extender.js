export let MagicItemActionHandlerExtender = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    MagicItemActionHandlerExtender = class MagicItemActionHandlerExtender extends coreModule.api.ActionHandlerExtender {
        constructor (actionHandler) {
            super()
            this.actionHandler = actionHandler
            this.actor = null
        }

        /**
     * Extend the action list
     */
        async extendActionHandler () {
            this.actor = this.actionHandler.actor
            if (!this.actor) return

            const actor = await MagicItems.actor(this.actor.id)

            if (!actor) return

            const magicItems = actor.items ?? []

            if (magicItems.length === 0) return

            const parentGroupId = 'magic-items'
            const parentGroupType = 'system'
            const parentGroupData = {
                id: parentGroupId,
                type: parentGroupType
            }

            magicItems.forEach((magicItem) => {
                if (magicItem.attuned && !this._isItemAttuned(magicItem)) return
                if (magicItem.equipped && !this._isItemEquipped(magicItem)) return

                const groupId = `magic-items_${magicItem.id}`
                const groupName = magicItem.name
                const groupType = 'system-derived'
                const groupInfo1 = `${magicItem.uses}/${magicItem.charges}`
                const groupData = {
                    id: groupId,
                    name: groupName,
                    type: groupType,
                    info1: groupInfo1
                }

                // Add group to HUD
                this.actionHandler.addGroup(groupData, parentGroupData)

                const actions = magicItem.ownedEntries.map((entry) => {
                    const effect = entry.item
                    const id = effect.id
                    const name = effect.name
                    const encodedValue = [
                        'magicItem',
                        `${magicItem.id}>${id}`
                    ].join('|')
                    const img = coreModule.api.Utils.getImage(effect)
                    const info1 = effect.consumption
                    const info2 = (effect.baseLevel) ? `${coreModule.api.Utils.i18n('DND5E.AbbreviationLevel')} ${effect.baseLevel}` : ''
                    return {
                        id,
                        name,
                        encodedValue,
                        img,
                        info1,
                        info2,
                        selected: true
                    }
                })

                // Add actions to action list
                this.actionHandler.addActions(actions, groupData)
            })
        }

        /**
     * Whether the magic item is equipped or not
     * @param {object} magicItem The item
     * @returns {boolean}
     */
        _isItemEquipped (magicItem) {
            return magicItem.item.system.equipped
        }

        /**
     * Whether the magic items is attuned or not
     * @param {object} magicItem The item
     * @returns {boolean}
     */
        _isItemAttuned (magicItem) {
            const attunement = magicItem.item.system.attunment
            const attunementRequired = CONFIG.DND5E.attunementTypes?.REQUIRED ?? 1

            return attunement !== attunementRequired;
        }
    }
})
