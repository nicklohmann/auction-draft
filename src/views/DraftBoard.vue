<script setup lang="ts">
import { ref, computed } from 'vue'
import { players, draftPlayer } from '../stores/draftStore'

const search = ref('')
const positionFilter = ref('ALL')
const prices = ref<Record<string, string>>({})

const filteredPlayers = computed(() => {
  return players.value
    .filter(p => !p.drafted)
    .filter(p => positionFilter.value === 'ALL' || p.position === positionFilter.value)
    .filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
})

function confirmMe(playerName: string) {
  const price = parseInt(prices.value[playerName] || '1')
  draftPlayer(playerName, 'Me', price)
  delete prices.value[playerName]
}

function confirmOther(playerName: string) {
  const price = parseInt(prices.value[playerName] || '1')
  draftPlayer(playerName, 'Other', price)
  delete prices.value[playerName]
}
</script>

<template>
  <div class="draft-board">
    <h2>Draft Board</h2>

    <div class="filters">
      <input v-model="search" placeholder="Search players..." />
      <select v-model="positionFilter">
        <option value="ALL">All Positions</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
      </select>
      <span>{{ filteredPlayers.length }} players available</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>POS</th>
          <th>Team</th>
          <th>KTC</th>
          <th>Suggested $</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in filteredPlayers" :key="player.name">
          <td>{{ player.name }}</td>
          <td>{{ player.position }}</td>
          <td>{{ player.team }}</td>
          <td>{{ player.ktcValue }}</td>
          <td>${{ player.value }}</td>
          <td class="actions">
            <input
              class="price-input"
              type="number"
              v-model="prices[player.name]"
              placeholder="$"
              min="1"
              @keyup.enter="confirmMe(player.name)"
            />
            <button class="btn-draft" @click="confirmMe(player.name)">Mine</button>
            <button class="btn-other" @click="confirmOther(player.name)">✕</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.draft-board { padding: 20px; }
.filters { display: flex; gap: 10px; margin-bottom: 15px; align-items: center; }
input, select { padding: 8px; background: #16213e; color: white; border: 1px solid #0f3460; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #16213e; }
th { background: #16213e; color: #4fc3f7; }
tr:hover { background: #16213e; }
.actions { display: flex; gap: 8px; align-items: center; }
.price-input { width: 55px; padding: 4px; text-align: center; }
.btn-draft { padding: 5px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-draft:hover { background: #43a047; }
.btn-other { padding: 5px 10px; background: #b71c1c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-other:hover { background: #e53935; }
</style>
