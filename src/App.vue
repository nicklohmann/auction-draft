<script setup lang="ts">
import { onMounted } from 'vue'
import { loadPlayers, remaining, spent } from './stores/draftStore'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  loadPlayers()
})
</script>

<template>
  <div id="app">
    <!-- Budget bar always visible at top -->
    <div class="budget-bar">
      <span>💰 Budget: ${{ remaining }} remaining</span>
      <span>Spent: ${{ spent }}</span>
      <nav>
        <button @click="router.push('/')">Draft Board</button>
        <button @click="router.push('/roster')">My Roster</button>
        <button @click="router.push('/log')">Draft Log</button>
      </nav>
    </div>

    <!-- Page content -->
    <router-view />
  </div>
</template>

<style>
.budget-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #1a1a2e;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.budget-bar button {
  margin-left: 10px;
  padding: 6px 12px;
  cursor: pointer;
  background: #16213e;
  color: white;
  border: 1px solid #0f3460;
  border-radius: 4px;
}

.budget-bar button:hover {
  background: #0f3460;
}

body {
  margin: 0;
  background: #0a0a1a;
  color: white;
  font-family: Arial, sans-serif;
}
</style>