// Import components
// ...

// Import our components
// ...

// Import interfaces
import type { GameVersion, XIVAbility } from '@types'

const DB_NAME = 'toki'
const ABILITIES_STORE_NAME = 'abilities'
const GAME_STORE_NAME = 'game'
const DB_STORES = [GAME_STORE_NAME, ABILITIES_STORE_NAME]
const DB_VERSION = 1

let store: Promise<IDBDatabase> | null = null

// Get the local IndexedDB database
function getDB(): Promise<IDBDatabase> {
  if (store) return store

  store = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result

      // Instantiate each store, if they don't exist
      DB_STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName))
          db.createObjectStore(storeName, { keyPath: 'id' })
      })
    }
  })

  return store
}

// Remove all entries in the IndexedDB database
export async function clearAll() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)

    request.onerror = () => reject(new Error('[Tōki] Failed to open IndexedDB'))
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(ABILITIES_STORE_NAME, 'readwrite')

      tx.onerror = () => reject(new Error('[Tōki] Failed to clear store'))
      tx.oncomplete = () => resolve()

      tx.objectStore(ABILITIES_STORE_NAME).clear()
    }
  })
}

// Retrieve a single entry in the IndexedDB database
export async function get(id: number): Promise<XIVAbility> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(ABILITIES_STORE_NAME, 'readonly')
    const store = tx.objectStore(ABILITIES_STORE_NAME)
    const req = store.get(id)

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Retrieve all entries in the IndexedDB database
export async function getAll(): Promise<XIVAbility[]> {
  const db = await getDB()

  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(ABILITIES_STORE_NAME, 'readonly')
    const store = tx.objectStore(ABILITIES_STORE_NAME)
    const req = store.getAll()

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Retrieve a single entry in the IndexedDB database
export async function getVersion(): Promise<GameVersion> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(GAME_STORE_NAME, 'readonly')
    const store = tx.objectStore(GAME_STORE_NAME)
    const req = store.getAll()

    req.onsuccess = () => resolve(req.result[0])
    req.onerror = () => reject(req.error)
  })
}

// Store an entry in the IndexedDB Ability database
export async function save(ability: XIVAbility) {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(ABILITIES_STORE_NAME, 'readwrite')
    const store = tx.objectStore(ABILITIES_STORE_NAME)
    const req = store.put(ability)

    req.onsuccess = () => resolve(true)
    req.onerror = () => reject(req.error)
  })
}

// Store an entry in the IndexedDB Game Version database
export async function saveVersion(version: GameVersion): Promise<Boolean> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(GAME_STORE_NAME, 'readwrite')
    const store = tx.objectStore(GAME_STORE_NAME)
    const req = store.put(version)

    req.onsuccess = () => resolve(true)
    req.onerror = () => reject(req.error)
  })
}
