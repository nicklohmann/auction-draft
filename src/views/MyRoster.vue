<script setup lang="ts">
import { myRoster, spent, remaining } from '../stores/draftStore'

const positionOrder = ['QB', 'RB', 'WR', 'TE']

const sortedRoster = () => {
  return [...myRoster.value].sort((a, b) => 
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )
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
    </div>

    <table v-if="myRoster.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>POS</th>
          <th>Team</th>
          <th>KTC</th>
          <th>Paid</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in sortedRoster()" :key="player.name">
          <td>{{ player.name }}</td>
          <td>{{ player.position }}</td>
          <td>{{ player.team }}</td>
          <td>{{ player.ktcValue }}</td>
          <td>${{ player.pricePaid }}</td>
          <td :class="player.pricePaid <= player.value ? 'good-value' : 'overpaid'">
            {{ player.pricePaid <= player.value ? '✅ Good value' : '⚠️ Overpaid' }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No players drafted yet.</p>
  </div>
</template>

<style scoped>
.roster {
  padding: 20px;
}

.summary {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat {
  background: #16213e;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
}

.label {
  display: block;
  font-size: 12px;
  color: #4fc3f7;
  margin-bottom: 5px;
}

.value {
  display: block;
  font-size: 24px;
  font-weight: bold;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #16213e;
}

th {
  background: #16213e;
  color: #4fc3f7;
}

tr:hover {
  background: #16213e;
}

.good-value {
  color: #4caf50;
}

.overpaid {
  color: #f44336;
}
</style>