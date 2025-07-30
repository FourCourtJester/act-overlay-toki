// Import components
import { api, atom, injectAtomInstance, injectPromise, injectStore } from '@zedux/react'

// Import our components
import { overlayAtom } from './overlay'
import { clearAll, getAll, save } from '../utils/indexedDB'

// Import interfaces
// ...

const GAME_VERSION = import.meta.env.VITE_GAME_VERSION

export const xivAPIAtom = atom('xivapi', () => {
  const overlay = injectAtomInstance(overlayAtom)
  const store = injectStore({})

  injectPromise(async () => {
    const cache = await getAll()
    const v = { id: 'v', value: GAME_VERSION }

    if (!cache.length) {
      await save(v)
    } else if (cache[cache.length - 1].value !== GAME_VERSION) {
      await clearAll()
      await save(v)
    }

    store.setState(
      cache.reduce((acc, ability) => {
        acc[ability.id] = ability
        return acc
      }, {})
    )
  }, [])

  return api(store).setExports({
    async fetch(id: number) {
      const state = store.getState()

      if (Object.prototype.hasOwnProperty.call(state, id)) return state[id]

      try {
        const response = await fetch(`https://xivapi.com/Action/${id}`)

        if (!response.ok) {
          const { Message } = await response.json()
          throw new Error(Message)
        }

        const json = await response.json()
        const ability = {
          charges: json?.MaxCharges ?? 1,
          id: json.ID,
          name: json.Name,
          icon: `https://xivapi.com${json.IconHD}`,
          recast: json.Recast100ms / 10,
          category: json.ActionCategory.ID,
        }

        store.setStateDeep({
          [id]: ability,
        })

        save(ability)
        overlay.exports.setRecast(ability)

        return ability
      } catch (err) {
        overlay.exports.remove(id)

        console.error(err)

        return undefined
      }
    },
    get(id) {
      const state = store.getState()

      if (!Object.prototype.hasOwnProperty.call(state, id)) {
        this.fetch(id)
        return null
      }

      return state[id]
    },
  })
})
