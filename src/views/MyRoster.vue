<script setup lang="ts">
import { computed } from 'vue'
import { myRoster, spent, remaining } from '../stores/draftStore'

const CORE_SPOTS = 11

const positionOrder = ['QB', 'RB', 'WR', 'TE']

const sortedRoster = computed(() => {
  return [...myRoster.value].sort((a, b) => 
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )
})

const corePlayersDrafted = computed(() => {
  return Math.min(myRoster.value.length, CORE_SPOTS)
})

const coreRemaining = computed(() => CORE_SPOTS - corePlayersDrafted.value)

const avgPerCoreRemaining = computed(() => {
  if (coreRemaining.value <= 0) return 0
  const benchSpots = 27 - CORE_SPOTS
  const reservedForBench = benchSpots * 1
  const budgetForCore = remaining.value - reservedForBench
  return Math.max(1, Math.round(budgetForCore / coreRemaining.value))
})

function getValueColor(pricePaid: number, suggestedValue: number): string {
  if (suggestedValue === 0) return 'white'
  const ratio = pricePaid / suggestedValue

  if (ratio <= 0.5) return '#1b5e20'       // dark green - massive steal
  if (ratio <= 0.7) return '#2e7d32'       // green - great value
  if (ratio <= 0.85) return '#66bb6a'      // light green - good value
  if (ratio <= 0.95) return '#a5d6a7'      // very light green - slight value
  if (ratio <= 1.05) return '#ffffff'      // white - even
  if (ratio <= 1.2) return '#ef9a9a'       // light red - slight overpay
  if (ratio <= 1.4) return '#e53935'       // red - overpay
  return '#b71c1c'                          // dark red - big overpay
}

function getValueText(pricePaid: number, suggestedValue: number): string {
  if (suggestedValue === 0) return '-'
  const saved = suggestedValue - pricePaid
  if (saved > 0) return `+$${saved}`
  if (saved < 0) return `-$${Math.abs(saved)}`
  return 'Even'
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
    </div>

    <table v-if="myRoster.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>POS</th>
          <th>Team</th>
          <th>KTC</th>
          <th>Suggested $</th>
          <th>Paid</th>
          <th>Value</th>
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
          <td :style="{ color: getValueColor(player.pricePaid, player.value), fontWeight: 'bold' }">
            {{ getValueText(player.pricePaid, player.value) }}
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
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #16213e; }
th { background: #16213e; color: #4fc3f7; }
tr:hover { background: #16213e; }
</style>
