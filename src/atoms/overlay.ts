// Import components
import {
  actionFactory,
  api,
  atom,
  createReducer,
  createStore,
  injectAtomInstance,
  injectEffect,
  injectStore,
} from '@zedux/react'

// Import our components
import { xivAPIAtom } from './xivapi'
import Worker from '../workers/worker?worker'

import traits from '../traits.json'

// Import interfaces
// ...

const worker = new Worker()

function adjust(ability, level) {
  if (!ability) return NaN

  if (ability.name in traits) {
    const adjustment = traits[ability.name]

    return level >= adjustment.level ? ability.recast - adjustment.modification : ability.recast
  }

  return ability?.recast ?? NaN
}

export const overlayAtom = atom('Tōki', () => {
  const xivapi = injectAtomInstance(xivAPIAtom)
  let pos = 'below'

  const reducers = createReducer({ cds: {}, inCombat: false, level: NaN })
    .reduce(actionFactory('AbilityUsed'), (state, payload) => {
      const { abilityId, timestamp } = payload
      const ability = xivapi.exports.get(abilityId)

      if (ability && ability?.recast <= Number(import.meta.env.VITE_ABILITY_RECAST_THRESHOLD))
        return state

      if (state.cds[abilityId] && ability?.MaxCharges > 1) {
        return {
          ...state,
          cds: {
            ...state.cds,
            [abilityId]: {
              ...state.cds[abilityId],
              charges: state.cds[abilityId].charges + 1,
            },
          },
        }
      }

      pos = pos === 'above' ? 'below' : 'above'

      return {
        ...state,
        cds: {
          ...state.cds,
          [abilityId]: {
            id: abilityId,
            position: pos,
            recast: adjust(ability, state.level),
            ts: new Date(timestamp).getTime(),
          },
        },
      }
    })
    .reduce(actionFactory('CombatState'), (state, payload) => {
      const { inACTCombat, inGameCombat } = payload
      const prev = state.inCombat

      if (prev && !inACTCombat)
        return {
          ...state,
          inCombat: inACTCombat,
          cds: {},
        }

      return {
        ...state,
        inCombat: inACTCombat,
      }
    })
    .reduce(actionFactory('LevelChanged'), (state, payload) => {
      const { level } = payload

      return {
        ...state,
        level,
      }
    })

  const store = injectStore(() => createStore(reducers))

  injectEffect(() => {
    worker.addEventListener('message', (event) => {
      store.dispatch(event.data)
    })
  }, [])

  return api(store).setExports({
    remove(id) {
      const ability = store.getState().cds[id]

      if (ability.charges - 1 > 0) {
        return store.setStateDeep({
          cds: {
            [ability.id]: {
              charges: ability.charges - 1,
            },
          },
        })
      }

      store.setState((_state) => {
        const cds = { ..._state.cds }
        delete cds[id]

        return { ..._state, cds }
      })
    },
    setRecast(ability) {
      const { id, recast } = ability
      const level = store.getState().level

      if (recast <= Number(import.meta.env.VITE_ABILITY_RECAST_THRESHOLD)) {
        this.remove(id)
        return false
      }

      store.setStateDeep({
        cds: {
          [id]: {
            recast: adjust(ability, level),
          },
        },
      })
    },
  })
})

export const activeCooldownsSelector = ({ get }) => {
  const { cds } = get(overlayAtom)
  const abilities = get(xivAPIAtom)

  return Object.values(cds)
    .sort((a, b) => a.ts - b.ts)
    .map((entry) => {
      return {
        ...abilities[entry.id],
        ...entry,
      }
    })
}
