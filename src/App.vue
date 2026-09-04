<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { loadPlayers, remaining, spent } from './stores/draftStore'
import { marketTilt, marketHeadline, coreValueDraftedPct } from './stores/marketSignal'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  loadPlayers()
})

// Continuous color: green (spend/neutral) -> amber -> red as tilt goes negative.
// Blends smoothly so the bar WARMS UP over many picks instead of snapping.
const tiltColor = computed(() => {
  const t = marketTilt.value // -100..+100
  if (t >= 0) return '#43a047'            // neutral/positive = green
  // -1..-100 : interpolate green -> amber -> red
  const p = Math.min(-t, 100) / 100        // 0..1 how negative
  // green (67,160,71) -> amber (251,140,0) -> red (229,57,53)
  let r, g, b
  if (p < 0.5) {
    const k = p / 0.5
    r = Math.round(67 + (251 - 67) * k)
    g = Math.round(160 + (140 - 160) * k)
    b = Math.round(71 + (0 - 71) * k)
  } else {
    const k = (p - 0.5) / 0.5
    r = Math.round(251 + (229 - 251) * k)
    g = Math.round(140 + (57 - 140) * k)
    b = Math.round(0 + (53 - 0) * k)
  }
  return `rgb(${r},${g},${b})`
})

// Needle position along a center-zero track: 50% = neutral, left = wait, right = spend.
const needlePct = computed(() => 50 + marketTilt.value / 2) // -100..100 -> 0..100

// Fade the whole thing in as the draft gets going (soft early).
const barOpacity = computed(() =>
  coreValueDraftedPct.value < 0.1 ? 0.5 : 1
)
</script>

<template>
  <div id="app">
    <!-- Budget bar always visible at top -->
    <div class="budget-bar">
      <span>💰 Budget: ${{ remaining }} remaining</span>
      <span>Spent: ${{ spent }}</span>

      <!-- Continuous market read: slides + warms up, no sudden flips -->
      <div class="market-read" :style="{ opacity: barOpacity }">
        <div class="mr-track">
          <div class="mr-center"></div>
          <div
            class="mr-needle"
            :style="{ left: needlePct + '%', background: tiltColor }"
          ></div>
        </div>
        <span class="mr-text" :style="{ color: tiltColor }">{{ marketHeadline }}</span>
      </div>

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

.market-read {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  margin: 0 16px;
  transition: opacity 0.4s ease;
}
.mr-track {
  position: relative;
  flex: 0 0 100px;
  height: 8px;
  background: linear-gradient(90deg, #e53935 0%, #fb8c00 50%, #43a047 75%, #4fc3f7 100%);
  border-radius: 4px;
  opacity: 0.35;
}
.mr-center {
  position: absolute;
  left: 50%;
  top: -2px; bottom: -2px;
  width: 1px;
  background: #cfd8e8;
  opacity: 0.5;
}
.mr-needle {
  position: absolute;
  top: -3px;
  width: 4px;
  height: 14px;
  border-radius: 2px;
  transform: translateX(-50%);
  box-shadow: 0 0 4px rgba(0,0,0,0.5);
  transition: left 0.5s ease, background 0.5s ease;
}
.mr-text {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.5s ease;
}

body {
  margin: 0;
  background: #0a0a1a;
  color: white;
  font-family: Arial, sans-serif;
}
</style>