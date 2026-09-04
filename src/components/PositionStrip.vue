<script setup lang="ts">
import { positionBoards } from '../stores/marketSignal'
// One-line strip: how many startable ($13+) players are left at each position.
// Dims a position once you're full there; highlights ones you still need that
// are running low.
</script>

<template>
  <div class="pos-strip">
    <span class="lead">$13+ left:</span>
    <template v-for="(b, i) in positionBoards" :key="b.pos">
      <span
        class="chip"
        :class="{ scarce: b.scarce, filled: b.youNeed === 0 }"
        :title="b.youNeed > 0 ? `you need ${b.youNeed} more` : 'you\'re set here'"
      >
        <span class="pos">{{ b.pos }}</span>
        <span class="cnt">{{ b.playersLeft }}</span>
        <span v-if="b.scarce" class="alert">⚠</span>
      </span>
      <span v-if="i < positionBoards.length - 1" class="dot">·</span>
    </template>
  </div>
</template>

<style scoped>
.pos-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 0 0 14px;
  background: #16213e;
  border-radius: 6px;
  font-size: 14px;
  flex-wrap: wrap;
}
.lead { color: #7c8db5; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 2px; }
.chip { display: inline-flex; align-items: center; gap: 6px; }
.chip .pos { color: #4fc3f7; font-weight: 700; }
.chip .cnt { color: #fff; font-weight: 700; font-variant-numeric: tabular-nums; }
.chip.filled { opacity: 0.4; }
.chip.filled .pos { color: #7c8db5; }
.chip.scarce { background: rgba(251,140,0,0.15); padding: 2px 8px; border-radius: 4px; }
.chip.scarce .pos { color: #fb8c00; }
.chip .alert { color: #fb8c00; font-size: 12px; }
.dot { color: #3a4a6b; }
</style>