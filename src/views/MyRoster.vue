<script setup lang="ts">
import { computed } from 'vue'
import { myRoster, spent, remaining, marketPremium, undraftPlayer, avgOtherTeamRemaining } from '../stores/draftStore'

const CORE_SPOTS = 11

const positionOrder = ['QB', 'RB', 'WR', 'TE']

const sortedRoster = computed(() => {
  return [...myRoster.value].sort((a, b) => 
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )
})

const corePlayersDrafted = computed(() => Math.min(myRoster.value.length, CORE_SPOTS))
const coreRemaining = computed(() => CORE_SPOTS - corePlayersDrafted.value)

const avgPerCoreRemaining = computed(() => {
  if (coreRemaining.value <= 0) return 0
  const reservedForBench = (27 - CORE_SPOTS) * 1
  const budgetForCore = remaining.value - reservedForBench
  return Math.max(1, Math.round(budgetForCore / coreRemaining.value))
})

function getValueColor(ratio: number): string {
  if (ratio <= 0.5) return '#1b5e20'
  if (ratio <= 0.7) return '#2e7d32'
  if (ratio <= 0.85) return '#66bb6a'
  if (ratio <= 0.95) return '#a5d6a7'
  if (ratio <= 1.05) return '#ffffff'
  if (ratio <= 1.2) return '#ef9a9a'
  if (ratio <= 1.4) return '#e53935'
  return '#b71c1c'
}

function vsValueText(pricePaid: number, suggested: number): string {
  if (suggested === 0) return '-'
  const saved = suggested - pricePaid
  if (saved > 0) return `+$${saved}`
  if (saved < 0) return `-$${Math.abs(saved)}`
  return 'Even'
}

function vsValueRatio(pricePaid: number, suggested: number): number {
  if (suggested === 0) return 1
  return pricePaid / suggested
}

function vsMarketRatio(pricePaid: number, suggested: number, position: string): number {
  if (suggested === 0) return 1
  const marketPct = (marketPremium.value[position] ?? 0) / 100
  const marketAdjusted = suggested * (1 + marketPct)
  return pricePaid / marketAdjusted
}

function vsMarketText(pricePaid: number, suggested: number, position: string): string {
  if (suggested === 0) return '-'
  const marketPct = marketPremium.value[position] ?? 0
  if (marketPct === 0) return 'No data'
  const marketAdjusted = suggested * (1 + marketPct / 100)
  const saved = Math.round(marketAdjusted - pricePaid)
  if (saved > 0) return `+$${saved} vs mkt`
  if (saved < 0) return `-$${Math.abs(saved)} vs mkt`
  return 'At market'
}
</script>

<template>
  <div class="roster">
    <h2>My Roster</h2>

    <div class="summary">
      <div class="stat">
        <span class="label">Players Drafted</span>
        <span class="value">{{ myRoster.length }}</span>
      </div>
      <div class="stat">
        <span class="label">Spent</span>
        <span class="value">${{ spent }}</span>
      </div>
      <div class="stat">
        <span class="label">Remaining</span>
        <span class="value">${{ remaining }}</span>
      </div>
      <div class="stat">
        <span class="label">Roster Spots Left</span>
        <span class="value">{{ 27 - myRoster.length }}</span>
      </div>
      <div class="stat highlight">
        <span class="label">Avg $ / Core Player Left</span>
        <span class="value">${{ avgPerCoreRemaining }}</span>
      </div>
      <div class="stat">
        <span class="label">Core Spots Left</span>
        <span class="value">{{ coreRemaining }} / {{ CORE_SPOTS }}</span>
      </div>
      <div class="stat">
        <span class="label">Avg Other Budget Left</span>
        <span class="value">${{ avgOtherTeamRemaining }}</span>
      </div>
    </div>

    <div class="market-summary">
      <h3>Market Premiums</h3>
      <div class="market-grid">
        <div v-for="pos in ['QB', 'RB', 'WR', 'TE']" :key="pos" class="market-stat">
          <span class="pos-label">{{ pos }}</span>
          <span
            class="market-value"
            :style="{ color: getValueColor(1 + (marketPremium[pos] ?? 0) / 100) }"
          >
            {{ marketPremium[pos] === 0 ? 'No data' : marketPremium[pos] > 0 ? `+${marketPremium[pos]}%` : `${marketPremium[pos]}%` }}
          </span>
        </div>
      </div>
    </div>

    <table v-if="myRoster.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>POS</th>
          <th>Team</th>
          <th>KTC</th>
          <th>Suggested</th>
          <th>Paid</th>
          <th>vs Suggested</th>
          <th>vs Market</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in sortedRoster" :key="player.name">
          <td>{{ player.name }}</td>
          <td>{{ player.position }}</td>
          <td>{{ player.team }}</td>
          <td>{{ player.ktcValue }}</td>
          <td>${{ player.value }}</td>
          <td>${{ player.pricePaid }}</td>
          <td :style="{ color: getValueColor(vsValueRatio(player.pricePaid, player.value)), fontWeight: 'bold' }">
            {{ vsValueText(player.pricePaid, player.value) }}
          </td>
          <td :style="{ color: getValueColor(vsMarketRatio(player.pricePaid, player.value, player.position)), fontWeight: 'bold' }">
            {{ vsMarketText(player.pricePaid, player.value, player.position) }}
          </td>
          <td>
            <button class="btn-undo" @click="undraftPlayer(player.name)">↩</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No players drafted yet.</p>
  </div>
</template>

<style scoped>
.roster { padding: 20px; }
.summary { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
.stat { background: #16213e; padding: 15px 20px; border-radius: 8px; text-align: center; min-width: 120px; }
.stat.highlight { background: #0f3460; border: 1px solid #4fc3f7; }
.label { display: block; font-size: 12px; color: #4fc3f7; margin-bottom: 5px; }
.value { display: block; font-size: 24px; font-weight: bold; }
.market-summary { background: #16213e; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
.market-summary h3 { margin: 0 0 10px 0; color: #4fc3f7; font-size: 14px; }
.market-grid { display: flex; gap: 30px; }
.market-stat { text-align: center; }
.pos-label { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
.market-value { font-size: 18px; font-weight: bold; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #16213e; }
th { background: #16213e; color: #4fc3f7; }
tr:hover { background: #16213e; }
.btn-undo { padding: 4px 8px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-undo:hover { background: #ef9a9a; color: black; }
</style>
