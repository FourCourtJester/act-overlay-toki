const DB_NAME = 'toki'
const STORE_NAME = 'abilities'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })

  return dbPromise
}

export async function clearAll() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)

    request.onerror = () => {
      reject(new Error('[Tōki] Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(STORE_NAME, 'readwrite')

      tx.onerror = () => {
        reject(new Error('[Tōki] Failed to clear store'))
      }

      tx.oncomplete = () => {
        console.log(`[Tōki] Cleared store "${STORE_NAME}" in "${DB_NAME}"`)
        resolve()
      }

      tx.objectStore(STORE_NAME).clear()
    }
  })
}

export async function get(id: number) {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAll() {
  const db = await getDb()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function save(ability: any) {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(ability)
    req.onsuccess = () => resolve(true)
    req.onerror = () => reject(req.error)
  })
}
