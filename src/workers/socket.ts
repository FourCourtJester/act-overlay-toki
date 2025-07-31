// Import components
// ...

// Import our components
// ...

// Import interfaces
import type { LogLevel, PartyChangedParty } from '@types'

const BASE_RETRY_DELAY = 1000 // start at 1s
const MAX_RETRY_DELAY = 32_000 // max 32s
const MSG_PREFIX = '[Tōki]'

export default class ACTSocket {
  #playerID?: string
  #retries = 0
  #t?: NodeJS.Timeout
  #ws?: WebSocket
  #wsURL?: string

  constructor() {
    self.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'connect': {
          this.#wsURL = e.data.url
          this.#connect()
          break
        }

        default: {
          break
        }
      }
    })
  }

  // PRIVATE FUNCTIONS

  // Connect function
  #connect() {
    if (this.#ws) this.#ws.close()
    if (!this.#wsURL) {
      this.#ws?.close()
      this.#reconnect()
    }

    this.#ws = new WebSocket(this.#wsURL!)

    this.#ws.addEventListener('open', () => {
      this.#retries = 0

      // Subscribe to ACTWS Event Types
      // LogLine - get player actions
      // PartyChanged - get player id/level
      this.#ws?.send(
        JSON.stringify({
          call: 'subscribe',
          events: ['ChangePrimaryPlayer', 'LogLine', 'PartyChanged'],
        })
      )

      this.#log('log', 'WebSocket connected')
    })

    this.#ws.addEventListener('message', this.#parse.bind(this))

    this.#ws.addEventListener('close', () => {
      this.#log('warn', 'WebSocket closed')
      this.#reconnect()
    })

    this.#ws.addEventListener('error', (err) => {
      this.#log('error', 'WebSocket error:', err)
      this.#ws?.close()
    })
  }

  // Logging function
  #log(level: LogLevel, ...params: any[]) {
    console?.[level](MSG_PREFIX, ...params)
  }

  // Message Parsing function
  #parse(e: MessageEvent) {
    try {
      const data = JSON.parse(e.data)

      switch (data.type) {
        case 'ChangePrimaryPlayer': {
          const id = Number(data.charID).toString(16).toUpperCase().padStart(8, '0')

          this.#playerID = id

          postMessage({
            type: 'PartyChanged',
            payload: {
              id,
            },
          })
          break
        }

        case 'PartyChanged': {
          const party: PartyChangedParty[] = data.party
          const you = party.find((member) => member.id === this.#playerID)

          postMessage({
            type: data.type,
            payload: {
              level: you?.level ?? 0,
            },
          })
          break
        }

        case 'LogLine': {
          const code = Number(data.line[0])

          switch (code) {
            // NetworkAbility
            // NetworkAOEAbility
            case 21:
            case 22: {
              // Break down the line
              const [, timestamp, sourceID, , abilityID, abilityName] = data.line

              // Ignore everyone else's casts
              if (sourceID.toUpperCase() !== this.#playerID) break

              postMessage({
                type: 'AbilityUsed',
                payload: {
                  timestamp: new Date(timestamp).getTime(),
                  abilityID: parseInt(abilityID, 16),
                  abilityName,
                },
              })

              break
            }

            // InCombat
            case 260: {
              break
            }

            // Every other LogLine
            default: {
              break
            }
          }

          break
        }

        default: {
          break
        }
      }
    } catch (err) {
      this.#log('warn', 'Parse error:', e.data)
      this.#log('error', err)
    }
  }

  // Reconnect function
  // Attempts reconnects on an exponential cliff
  // capped at 32s
  #reconnect() {
    if (this.#t) return false

    const delay = Math.min(BASE_RETRY_DELAY * 2 ** this.#retries, MAX_RETRY_DELAY)
    this.#log('log', `Reconnecting in ${delay / 1000}s...`)

    this.#t = setTimeout(() => {
      this.#retries++

      clearTimeout(this.#t)
      this.#t = undefined

      this.#connect()
    }, delay)
  }

  // PUBLIC FUNCTIONS
  // ...
}
