<script setup lang="ts">
import {
  marketState,
  marketMessage,
  buyingPowerIndex,
  roomMoneyRemaining,
  remainingCoreValue,
  suggestedBidMultiplier,
  coreValueDraftedPct,
  VALUE_FLOOR,
} from '../stores/marketSignal'
import { computed } from 'vue'

// Map state -> accent color. Green normal, amber watch, red hold, blue spend.
const accent = computed(() => {
  switch (marketState.value) {
    case 'hold': return '#e53935'   // red — the money's gone, wait
    case 'watch': return '#fb8c00'  // amber — softening, get patient
    case 'spend': return '#4fc3f7'  // blue — don't strand budget
    case 'early': return '#607d8b'  // grey — nothing to read yet
    default: return '#43a047'       // green — bid normally
  }
})

const label = computed(() => {
  switch (marketState.value) {
    case 'hold': return 'HOLD'
    case 'watch': return 'GET PATIENT'
    case 'spend': return 'SPEND UP'
    case 'early': return 'WARMING UP'
    default: return 'NORMAL'
  }
})

// Buying-power meter: baseline sits at 100%. Below = room weakening.
const powerPct = computed(() => Math.round(buyingPowerIndex.value * 100))
const bidPct = computed(() => Math.round(suggestedBidMultiplier.value * 100))
const draftedPct = computed(() => Math.round(coreValueDraftedPct.value * 100))
// Clamp the meter fill to a sane 0–130% visual range.
const meterFill = computed(() =>
  Math.max(0, Math.min(130, powerPct.value)) / 130 * 100
)
</script>

<template>
  <div class="market-signal" :style="{ '--accent': accent }">
    <div class="left">
      <span class="tag">{{ label }}</span>
      <span class="msg">{{ marketMessage }}</span>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="num">${{ roomMoneyRemaining }}</span>
        <span class="cap">room left</span>
      </div>
      <div class="stat">
        <span class="num">${{ remainingCoreValue }}</span>
        <span class="cap">${{ VALUE_FLOOR }}+ value left</span>
      </div>
      <div class="stat">
        <span class="num">{{ bidPct }}%</span>
        <span class="cap">of sheet</span>
      </div>
    </div>

    <div class="meter" :title="`Buying power ${powerPct}% of baseline · ${draftedPct}% of core value drafted`">
      <div class="meter-track">
        <div class="meter-fill" :style="{ width: meterFill + '%' }"></div>
        <div class="meter-baseline"></div>
      </div>
      <span class="meter-cap">buying power {{ powerPct }}%</span>
    </div>
  </div>
</template>

<style scoped>
.market-signal {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 18px;
  margin: 0 0 16px;
  background: #16213e;
  border: 1px solid var(--accent);
  border-left: 5px solid var(--accent);
  border-radius: 6px;
  color: #e8eefc;
  flex-wrap: wrap;
}
.left { display: flex; align-items: center; gap: 14px; flex: 1 1 320px; min-width: 260px; }
.tag {
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #0d1424;
  background: var(--accent);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}
.msg { font-size: 14px; line-height: 1.35; }
.stats { display: flex; gap: 18px; }
.stat { display: flex; flex-direction: column; align-items: flex-end; }
.num { font-weight: 700; font-size: 16px; color: #fff; font-variant-numeric: tabular-nums; }
.cap { font-size: 11px; color: #8fa3c8; text-transform: uppercase; letter-spacing: 0.04em; }
.meter { display: flex; flex-direction: column; gap: 4px; min-width: 140px; }
.meter-track {
  position: relative;
  height: 8px;
  background: #0d1424;
  border-radius: 4px;
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}
/* Baseline marker at 100% of the 0–130 scale (i.e. 100/130 of the width). */
.meter-baseline {
  position: absolute;
  top: 0; bottom: 0;
  left: 76.9%;
  width: 2px;
  background: #cfd8e8;
  opacity: 0.6;
}
.meter-cap { font-size: 11px; color: #8fa3c8; font-variant-numeric: tabular-nums; }
</style>