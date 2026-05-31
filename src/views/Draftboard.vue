<script setup lang="ts">
import { ref, computed } from 'vue'
import { players, draftPlayer } from '../stores/draftStore'

const search = ref('')
const positionFilter = ref('ALL')
const showDraftModal = ref(false)
const selectedPlayer = ref('')
const draftedBy = ref('Me')
const pricePaid = ref(1)

const filteredPlayers = computed(() => {
  return players.value
    .filter(p => !p.drafted)
    .filter(p => positionFilter.value === 'ALL' || p.position === positionFilter.value)
    .filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
})

function openDraftModal(playerName: string) {
  selectedPlayer.value = playerName
  pricePaid.value = 1
  draftedBy.value = 'Me'
  showDraftModal.value = true
}

function confirmDraft() {
  draftPlayer(selectedPlayer.value, draftedBy.value, pricePaid.value)
  showDraftModal.value = false
}
</script>

<template>
  <div class="draft-board">
    <h2>Draft Board</h2>

    <!-- Filters -->
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

    <!-- Player Table -->
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
          <td>
            <button @click="openDraftModal(player.name)">Draft</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Draft Modal -->
    <div v-if="showDraftModal" class="modal-overlay">
      <div class="modal">
        <h3>Draft {{ selectedPlayer }}</h3>
        <div>
          <label>Drafted By:</label>
          <select v-model="draftedBy">
            <option value="Me">Me</option>
            <option value="Other">Other Team</option>
          </select>
        </div>
        <div>
          <label>Price Paid: $</label>
          <input type="number" v-model="pricePaid" min="1" />
        </div>
        <div class="modal-buttons">
          <button @click="confirmDraft">Confirm</button>
          <button @click="showDraftModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draft-board {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}

input, select {
  padding: 8px;
  background: #16213e;
  color: white;
  border: 1px solid #0f3460;
  border-radius: 4px;
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

button {
  padding: 5px 10px;
  background: #0f3460;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #4fc3f7;
  color: black;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #1a1a2e;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #0f3460;
  min-width: 300px;
}

.modal div {
  margin: 15px 0;
}

.modal-buttons {
  display: flex;
  gap: 10px;
}
</style>