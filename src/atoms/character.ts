// Import components
import {
  actionFactory,
  api,
  atom,
  createReducer,
  createStore,
  injectEffect,
  injectStore,
} from '@zedux/react'

// Import our components
// import { overlayAtom } from './abilities'
import worker from '@workers/instance'

// Import interfaces
import type { Store } from '@zedux/react'
import type { CharacterPayload, CharacterStore } from '@types'

const INITIAL_STATE = {
  id: undefined,
  level: NaN,
} as CharacterStore

// Reducers builder
function createReducers() {
  return createReducer(INITIAL_STATE).reduce(
    actionFactory<CharacterPayload>('PartyChanged'),
    (state, payload) => {
      return {
        ...state,
        ...payload,
      }
    }
  )
}

// The actual Atom
const characterAtom = atom('character', () => {
  const store: Store<CharacterStore> = injectStore(() => createStore(createReducers()))

  injectEffect(() => {
    worker.addEventListener('message', (event) => store.dispatch(event.data))
  }, [])

  return api(store).setExports({})
})

export default characterAtom
