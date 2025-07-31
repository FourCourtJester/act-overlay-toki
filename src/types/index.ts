export interface Ability {
  category: number
  charges: number
  icon: string
  id: number
  maxCharges: number
  name: string
  recast: number
  timestamp: number
}

export interface AbilityRemovePayload {
  id: number
}

export interface AbilityUpdatePayload {
  xivAbility: Omit<Ability, 'charges'>
}

export interface AbilityUsedPayload {
  abilityID: number
  abilityName: string
  timestamp: string
}

export type AbilitiesStore = Ability[]

export interface CharacterStore {
  id?: string
  level: number
}

export interface CharacterPayload {
  id: string
  level?: number
}

export interface GameVersion {
  id: string
  value: string
}

export interface IconProps {
  ability: Ability
  now: number
}

export type LogLevel = 'debug' | 'error' | 'log' | 'warn'

export interface PartyChangedParty {
  id: string
  level: number
}

export interface Trait {
  level: number
  modification: {
    maxCharges?: number
    recast?: number
  }
}

export type XIVAbility = Omit<Ability, 'charges' | 'timestamp'>

export interface XIVAPIStore {
  [key: string]: XIVAbility
}
