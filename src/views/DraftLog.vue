<script setup lang="ts">
import { computed } from 'vue'
import { draftLog, undraftPlayer } from '../stores/draftStore'

const reversedLog = computed(() => [...draftLog.value].reverse())
</script>

<template>
  <div class="draft-log">
    <h2>Draft Log</h2>
    <p class="count">{{ draftLog.length }} players drafted</p>

    <table v-if="draftLog.length > 0">
      <thead>
        <tr>
          <th>Pick</th>
          <th>Name</th>
          <th>POS</th>
          <th>Team</th>
          <th>KTC</th>
          <th>Suggested</th>
          <th>Paid</th>
          <th>By</th>
          <th>vs Suggested</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in reversedLog"
          :key="entry.pick"
          :class="entry.draftedBy === 'Me' ? 'my-pick' : ''"
        >
          <td>{{ entry.pick }}</td>
          <td>{{ entry.name }}</td>
          <td>{{ entry.position }}</td>
          <td>{{ entry.team }}</td>
          <td>{{ entry.ktcValue }}</td>
          <td>${{ entry.suggestedValue }}</td>
          <td>${{ entry.pricePaid }}</td>
          <td :class="entry.draftedBy === 'Me' ? 'me' : 'other'">
            {{ entry.draftedBy === 'Me' ? '🟢 Me' : '⚫ Other' }}
          </td>
          <td>
            <span v-if="entry.suggestedValue > 0">
              {{ entry.pricePaid <= entry.suggestedValue
                ? `+$${entry.suggestedValue - entry.pricePaid}`
                : `-$${entry.pricePaid - entry.suggestedValue}` }}
            </span>
          </td>
          <td>
            <button class="btn-undo" @click="undraftPlayer(entry.name)">↩</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No players drafted yet.</p>
  </div>
</template>

<style scoped>
.draft-log { padding: 20px; }
.count { color: #4fc3f7; margin-bottom: 15px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #16213e; }
th { background: #16213e; color: #4fc3f7; }
tr:hover { background: #16213e; }
.my-pick { background: rgba(46, 125, 50, 0.15); }
.my-pick:hover { background: rgba(46, 125, 50, 0.25) !important; }
.me { color: #66bb6a; font-weight: bold; }
.other { color: #888; }
.btn-undo { padding: 4px 8px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-undo:hover { background: #ef9a9a; color: black; }
</style>
