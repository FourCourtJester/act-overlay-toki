declare const self: DedicatedWorkerGlobalScope

let ws: WebSocket | null = null
let retryCount = 0
let reconnectTimer: number | null = null
let playerId: string | null = null

const MAX_RETRY_DELAY = 30_000 // max 30s
const BASE_RETRY_DELAY = 1000 // start at 1s

function connect() {
  if (ws) ws.close()

  ws = new WebSocket('ws://127.0.0.1:10501/ws')

  ws.addEventListener('open', () => {
    retryCount = 0

    ws?.send(JSON.stringify({ call: 'subscribe', events: ['ChangePrimaryPlayer', 'LogLine'] }))

    console.log('[Tōki] WebSocket connected')
  })

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'ChangePrimaryPlayer') {
        playerId = Number(data.charID).toString(16).toUpperCase().padStart(8, '0')
        console.log('[Tōki] Primary player ID set to', playerId)
        return
      }

      // Opcode 21 = Ability used
      if (data.type === 'LogLine' && ['21', '22'].includes(data.line[0])) {
        const [opcode, timestamp, sourceId, sourceName, abilityId, abilityName] = data.line

        // Only continue if it's us
        if (sourceId.toUpperCase() !== playerId) return

        // Dispatch valid ability cast
        postMessage({
          type: 'AbilityUsed',
          payload: {
            timestamp,
            abilityId: parseInt(abilityId, 16),
            abilityName,
          },
        })
      }

      if (data.type === 'LogLine' && data.line[0] === '260') {
        const [opcode, timestamp, inACTCombat, inGameCombat] = data.line

        postMessage({
          type: 'CombatState',
          payload: {
            inACTCombat,
            inGameCombat,
          },
        })
      }
    } catch (err) {
      console.warn('[Tōki] Parse error:', event.data)
      console.error(err)
    }
  })

  ws.addEventListener('close', () => {
    console.warn('[Tōki] WebSocket closed')
    scheduleReconnect()
  })

  ws.addEventListener('error', (err) => {
    console.error('[Tōki] WebSocket error:', err)
    ws?.close()
  })
}

function scheduleReconnect() {
  if (reconnectTimer) return

  const delay = Math.min(BASE_RETRY_DELAY * 2 ** retryCount, MAX_RETRY_DELAY)
  console.log(`[Tōki] Reconnecting in ${delay / 1000}s...`)

  reconnectTimer = setTimeout(() => {
    retryCount++
    reconnectTimer = null
    connect()
  }, delay) as unknown as number
}

// Start immediately
connect()
