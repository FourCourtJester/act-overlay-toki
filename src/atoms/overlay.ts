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
      // { inACTCombat, inGameCombat }
      return {
        ...state,
        inCombat: payload.inACTCombat,
      }
    })

  const store = injectStore(() => createStore(reducers))

  injectEffect(() => {
    worker.addEventListener('message', (event) => {
      store.dispatch(event.data)
    })
  }, [])

  injectEffect(() => {
    const interval = setInterval(() => {
      const state = store.getState()
      const now = Date.now()

      const updated = Object.fromEntries(
        Object.entries(state.cds).map(([id, cd]) => {
          const msRemaining = cd.recast * 1000 - (now - cd.ts)
          const remaining = Math.ceil(msRemaining / 1000) // in seconds

          return [id, { ...cd, remaining: remaining < 0 ? 0 : remaining }]
        })
      )

      store.setState((prev) => ({
        ...prev,
        cds: updated,
      }))
    }, 1000)

    return () => clearInterval(interval)
  })

  return api(store).setExports({
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
