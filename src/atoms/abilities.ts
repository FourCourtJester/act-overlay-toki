// Import components
import {
  actionFactory,
  api,
  atom,
  createReducer,
  createStore,
  injectAtomInstance,
  injectStore,
} from '@zedux/react'

// Import our components
import characterAtom from '@atoms/character'

import Traits from '../traits.json'

// Import interfaces
import type { Store } from '@zedux/react'
import type { AbilitiesStore, AbilityRemovePayload, AbilityUpdatePayload, Trait } from '@types'

const INITIAL_STATE = {
  abilities: [],
  i: 0,
} as AbilitiesStore

// The actual Atom
const abilitiesAtom = atom('abilities', () => {
  // Atoms
  const character = injectAtomInstance(characterAtom)

  // Store
  const store: Store<AbilitiesStore> = injectStore(() =>
    createStore(
      createReducer(INITIAL_STATE)
        .reduce(actionFactory<AbilityRemovePayload>('AbilityRemove'), (state, payload) => {
          const next = { ...state, abilities: [...state.abilities] }
          const abilityNdex = next.abilities.findIndex((a) => a.id === payload.id)
          const ability = next.abilities[abilityNdex]

          // Remove a charge
          ability.charges--

          // If all charges removed, remove the ability
          // If not, reset the countdown
          if (ability.charges <= 0) next.abilities.splice(abilityNdex, 1)
          else ability.timestamp = Date.now() - Number(import.meta.env.VITE_ICON_TTL) * 1000

          return next
        })
        .reduce(actionFactory<AbilityUpdatePayload>('AbilityUpdate'), (state, payload) => {
          const { xivAbility } = payload
          const next = { ...state, abilities: [...state.abilities] }

          // Ignore invalid abilities
          if (xivAbility.category === -1) return next

          const abilityNdex = state.abilities.findIndex((a) => a.id === xivAbility.id)
          const ability = state.abilities[abilityNdex] ?? undefined

          // Ignore abilities outside of the threshold
          if (xivAbility.recast <= Number(import.meta.env.VITE_ABILITY_RECAST_THRESHOLD))
            return next

          // Update charges
          if (ability && xivAbility.maxCharges > 1) {
            next.abilities[abilityNdex].charges++
            return next
          }

          // New ability cooldown
          const newAbility = { ...xivAbility, charges: 1 }

          // Character Level + Adjustments
          // Adjustments include recast and maxCharges
          if (Object.prototype.hasOwnProperty.call(Traits, xivAbility.name)) {
            const { level } = character.getState()
            const trait: Trait = Traits[xivAbility.name as keyof typeof Traits]

            if (level >= trait.level) {
              Object.entries(trait.modification).forEach(([key, val]) => {
                newAbility[key as keyof typeof trait.modification] += val
              })
            }
          }

          // Add the ability cooldown
          next.abilities.push(newAbility)

          return next
        })
    )
  )

  return api(store).setExports({})
})

export default abilitiesAtom
