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

// Import interfaces
// ...

const worker = new Worker()

export const overlayAtom = atom('Tōki', () => {
  const xivapi = injectAtomInstance(xivAPIAtom)

  const reducers = createReducer({ cds: {}, inCombat: false })
    .reduce(actionFactory('AbilityUsed'), (state, payload) => {
      const { abilityId, timestamp } = payload
      const ability = xivapi.exports.get(abilityId)

      return {
        ...state,
        cds: {
          ...state.cds,
          [abilityId]: {
            id: abilityId,
            recast: ability?.recast ?? NaN,
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

  const store = injectStore(() => createStore(reducers))

  injectEffect(() => {
    worker.addEventListener('message', (event) => {
      store.dispatch(event.data)
    })
  }, [])

  return api(store).setExports({
    remove(id) {
      store.setState((_state) => {
        const cds = { ..._state.cds }
        delete cds[id]

        return { ..._state, cds }
      })
    },
    setRecast(ability) {
      const { id, recast } = ability

      store.setStateDeep({
        cds: {
          [id]: {
            recast,
          },
        },
      })
    },
  })
})

export const activeCooldownsSelector = ({ get }) => {
  const { cds } = get(overlayAtom)
  const abilities = get(xivAPIAtom)

  return Object.values(cds).map((entry) => {
    return {
      ...abilities[entry.id],
      ...entry,
    }
  })
}
