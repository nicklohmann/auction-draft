<script setup lang="ts">
import { positionBoards } from '../stores/marketSignal'
import { marketPremium } from '../stores/draftStore'

// Pairs each position's remaining startable value with the premium you already
// track. Reads left-to-right: how the room prices it, then how much is left.
</script>

<template>
  <div class="pos-value">
    <h3>Value Left on Board <span class="sub">startable ($13+) only</span></h3>
    <div class="grid">
      <div
        v-for="b in positionBoards"
        :key="b.pos"
        class="cell"
        :class="{ scarce: b.scarce, filled: b.youNeed === 0 }"
      >
        <div class="pos">{{ b.pos }}</div>

        <div class="prem" :class="(marketPremium[b.pos] ?? 0) < 0 ? 'neg' : 'pos'">
          <template v-if="marketPremium[b.pos] !== undefined && b.pctValueLeft < 1">
            {{ (marketPremium[b.pos] ?? 0) > 0 ? '+' : '' }}{{ marketPremium[b.pos] }}%
          </template>
          <template v-else>—</template>
        </div>

        <div class="left">
          <span class="val">${{ b.valueLeft }}</span>
          <span class="cnt">{{ b.playersLeft }} left</span>
        </div>

        <div class="bar">
          <div class="fill" :style="{ width: Math.round(b.pctValueLeft * 100) + '%' }"></div>
        </div>

        <div class="need">
          <template v-if="b.youNeed > 0">you need {{ b.youNeed }} more</template>
          <template v-else>set here ✓</template>
        </div>

        <div v-if="b.scarce" class="flag">JUMP IN — running out</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pos-value { background: #16213e; border-radius: 8px; padding: 16px 18px; margin: 16px 0; }
h3 { margin: 0 0 12px; color: #4fc3f7; font-size: 15px; }
.sub { color: #7c8db5; font-size: 12px; font-weight: 400; margin-left: 6px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cell {
  background: #0f1b33;
  border: 1px solid #1e3050;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cell.scarce { border-color: #fb8c00; box-shadow: 0 0 0 1px #fb8c00 inset; }
.cell.filled { opacity: 0.55; }
.pos { font-weight: 800; color: #cfe0ff; letter-spacing: 0.05em; font-size: 13px; }
.prem { font-size: 13px; font-weight: 700; }
.prem.neg { color: #4caf50; }   /* going cheap = good for you = green */
.prem.pos { color: #ef5350; }   /* going expensive = red */
.left { display: flex; align-items: baseline; gap: 8px; }
.val { font-size: 20px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; }
.cnt { font-size: 12px; color: #8fa3c8; }
.need { font-size: 11px; color: #9db4dd; }
.bar { height: 6px; background: #091327; border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: #4fc3f7; transition: width 0.3s ease; }
.flag {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #0d1424;
  background: #fb8c00;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
}
</style>