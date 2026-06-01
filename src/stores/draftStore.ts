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
  value: number
  pricePaid: number
}

export interface DraftLogEntry {
  pick: number
  name: string
  position: string
  team: string
  ktcValue: number
  suggestedValue: number
  pricePaid: number
  draftedBy: string
}

export const budget = ref(500)
export const spent = ref(0)
export const remaining = computed(() => budget.value - spent.value)

export const players = ref<Player[]>([])
export const myRoster = ref<RosterPlayer[]>([])
export const draftLog = ref<DraftLogEntry[]>([])
export const allDrafted = ref<{position: string, pricePaid: number, value: number}[]>([])

export const marketPremium = computed(() => {
  const positions = ['QB', 'RB', 'WR', 'TE']
  const result: Record<string, number> = {}
  for (const pos of positions) {
    const posPlayers = allDrafted.value.filter(p => p.position === pos && p.value > 0)
    if (posPlayers.length === 0) { result[pos] = 0; continue }
    const avgRatio = posPlayers.reduce((sum, p) => sum + (p.pricePaid / p.value), 0) / posPlayers.length
    result[pos] = Math.round((avgRatio - 1) * 100)
  }
  return result
})

export async function loadPlayers() {
  const response = await fetch('/ktc_auction_final.csv')
  const text = await response.text()
  const lines = text.trim().split('\n')
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

export function draftPlayer(playerName: string, draftedBy: string, pricePaid: number) {
  const player = players.value.find(p => p.name === playerName)
  if (!player) return

  player.drafted = true
  player.draftedBy = draftedBy
  player.pricePaid = pricePaid

  allDrafted.value.push({ position: player.position, pricePaid, value: player.value })

  draftLog.value.push({
    pick: draftLog.value.length + 1,
    name: player.name,
    position: player.position,
    team: player.team,
    ktcValue: player.ktcValue,
    suggestedValue: player.value,
    pricePaid,
    draftedBy
  })

  if (draftedBy === 'Me') {
    spent.value += pricePaid
    myRoster.value.push({
      name: player.name,
      position: player.position,
      team: player.team,
      ktcValue: player.ktcValue,
      value: player.value,
      pricePaid
    })
  }
}

export function undraftPlayer(playerName: string) {
  const player = players.value.find(p => p.name === playerName)
  if (!player) return

  // Restore player to board
  player.drafted = false
  player.draftedBy = ''
  player.pricePaid = 0

  // Remove from draft log
  const logIndex = draftLog.value.findIndex(e => e.name === playerName)
  if (logIndex !== -1) {
    const entry = draftLog.value[logIndex]

    // Remove from allDrafted market tracking
    const marketIndex = allDrafted.value.findIndex(
      d => d.position === entry.position && d.pricePaid === entry.pricePaid
    )
    if (marketIndex !== -1) allDrafted.value.splice(marketIndex, 1)

    // If it was my pick restore budget
    if (entry.draftedBy === 'Me') {
      spent.value -= entry.pricePaid
      myRoster.value = myRoster.value.filter(p => p.name !== playerName)
    }

    draftLog.value.splice(logIndex, 1)

    // Renumber picks
    draftLog.value.forEach((e, i) => e.pick = i + 1)
  }
}

export const totalSpentByAll = computed(() => 
  allDrafted.value.reduce((sum, p) => sum + p.pricePaid, 0)
)

export const avgOtherTeamRemaining = computed(() => {
  const otherTeamsSpent = totalSpentByAll.value - spent.value
  const otherTeamsBudget = 11 * 500
  return Math.round((otherTeamsBudget - otherTeamsSpent) / 11)
})
