import { ref, computed } from 'vue'

export interface Player {
  name: string
  position: string
  team: string
  ktcValue: number
  value: number
  drafted: boolean
  draftedBy: string
  pricePaid: number
}

export interface RosterPlayer {
  name: string
  position: string
  team: string
  ktcValue: number
  pricePaid: number
}

// Budget
export const budget = ref(500)
export const spent = ref(0)
export const remaining = computed(() => budget.value - spent.value)

// Players
export const players = ref<Player[]>([])
export const myRoster = ref<RosterPlayer[]>([])

// Load players from CSV
export async function loadPlayers() {
  const response = await fetch('/ktc_auction_final.csv')
  const text = await response.text()
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',')

  players.value = lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      name: values[0],
      position: values[1],
      team: values[2],
      ktcValue: parseInt(values[3]),
      value: parseInt(values[4]),
      drafted: false,
      draftedBy: '',
      pricePaid: 0
    }
  })
}

// Draft a player
export function draftPlayer(playerName: string, draftedBy: string, pricePaid: number) {
  const player = players.value.find(p => p.name === playerName)
  if (!player) return

  player.drafted = true
  player.draftedBy = draftedBy
  player.pricePaid = pricePaid

  if (draftedBy === 'Me') {
    spent.value += pricePaid
    myRoster.value.push({
      name: player.name,
      position: player.position,
      team: player.team,
      ktcValue: player.ktcValue,
      pricePaid
    })
  }
}