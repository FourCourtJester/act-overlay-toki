// Import components
import {
  api,
  atom,
  injectAtomInstance,
  injectEffect,
  injectPromise,
  injectStore,
} from '@zedux/react'

// Import our components
// import { overlayAtom } from './abilities'
import abilitiesAtom from '@atoms/abilities'
import { clearAll, getAll, getVersion, save, saveVersion } from '@utils/indexedDB'
import worker from '@workers/instance'

// Import interfaces
import type { Store } from '@zedux/react'
import type { AbilityUsedPayload, GameVersion, XIVAbility, XIVAPIStore } from '@types'

const BASE_URL = 'https://xivapi.com'
const INITIAL_STATE = {} as XIVAPIStore
const INVALID_ABILITY = {
  category: -1,
  maxCharges: 0,
  icon: `https://xivapi.com/i/000000/000000.png`,
  name: 'Invalid Action',
  recast: 0,
}

// The actual Atom
const xivAPIAtom = atom('xivapi', () => {
  // Other Atoms
  const abilities = injectAtomInstance(abilitiesAtom)
  // Store
  const store: Store<XIVAPIStore> = injectStore(INITIAL_STATE)
  // Exports
  const exports = {
    async fetch(payload: AbilityUsedPayload) {
      const { abilityID, timestamp } = payload
      const state = store.getState()

      // Return cached value
      if (Object.prototype.hasOwnProperty.call(state, abilityID)) {
        abilities.dispatch({
          type: 'AbilityUpdate',
          payload: { xivAbility: { ...state[abilityID], timestamp } },
        })
        return state[abilityID]
      }

      try {
        // Fetch from XIVAPI
        const response = await fetch(`${BASE_URL}/Action/${abilityID}`)

        // 404 or Error
        if (!response.ok) throw response

        // Create base ability
        const json = await response.json()
        const ability = {
          category: json.ActionCategory.ID,
          maxCharges: Number(json?.MaxCharges) || 1,
          icon: `https://xivapi.com${json.IconHD}`,
          id: Number(json.ID),
          name: json.Name,
          recast: json.Recast100ms / 10,
        } as XIVAbility

        // Update this atom
        store.setStateDeep({
          [abilityID]: ability,
        })

        // Update the cache
        save(ability)

        // Update the abilities atom
        abilities.dispatch({
          type: 'AbilityUpdate',
          payload: { xivAbility: { ...ability, timestamp } },
        })

        return ability
      } catch (err) {
        if (err instanceof Response && err.status === 404) {
          // Ability does not exist
          const { abilityID } = payload
          const invalidAbility: XIVAbility = { ...INVALID_ABILITY, id: abilityID }

          // Update this atom
          store.setStateDeep({
            [abilityID]: invalidAbility,
          })

          // Update the cache
          save(invalidAbility)

          // Update the abilities atom
          abilities.dispatch({
            type: 'AbilityUpdate',
            payload: { xivAbility: { ...invalidAbility, timestamp } },
          })
        } else
          // Some other kind of error
          console.error(err)

        return null
      }
    },
    async get(payload: AbilityUsedPayload) {
      const { abilityID, timestamp } = payload
      const state = store.getState()

      // Return cached value
      if (Object.prototype.hasOwnProperty.call(state, abilityID)) {
        abilities.dispatch({
          type: 'AbilityUpdate',
          payload: { xivAbility: { ...state[abilityID], timestamp } },
        })
        return state[abilityID]
      }

      // Fetch from XIVAPI
      return await this.fetch(payload)
    },
  }

  // Populate the store from IndexedDB
  injectPromise(async () => {
    const cache = await getAll()
    const version = await getVersion()
    const currentVersion: GameVersion = { id: 'version', value: import.meta.env.VITE_GAME_VERSION }

    if (!cache.length)
      // If no entries, store current game version
      await saveVersion(currentVersion)
    else if (version.value !== import.meta.env.VITE_GAME_VERSION) {
      // Game version has changed
      await clearAll()
      await saveVersion(currentVersion)
    }

    // Populate the store
    cache.forEach((ability) =>
      store.setStateDeep({
        [ability.id]: ability,
      })
    )
  }, [])

  injectEffect(() => {
    worker.addEventListener('message', (event) => {
      const { type, payload } = event.data

      switch (type) {
        case 'AbilityUsed': {
          exports.get(payload)
          break
        }
        default: {
          break
        }
      }
    })
  }, [])

  return api(store).setExports(exports)
})

export default xivAPIAtom
