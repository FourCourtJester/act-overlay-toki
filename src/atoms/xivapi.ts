// Import components
import { api, atom, injectAtomInstance, injectPromise, injectStore } from '@zedux/react'

// Import our components
import { overlayAtom } from './overlay'
import { getAll, save } from '../utils/indexedDB'

// Import interfaces
// ...

export const xivAPIAtom = atom('xivapi', () => {
  const overlay = injectAtomInstance(overlayAtom)
  const store = injectStore({})

  injectPromise(async () => {
    const cache = await getAll()

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
