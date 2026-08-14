import { computed } from 'vue'
import { players, budget, spent, myRoster } from './draftStore'

/**
 * Market Signal — tells you when to hold your money.
 *
 * The idea: only players worth $13+ are worth spending real money on. As the
 * room overpays for players early, cash drains faster than that pool of
 * players does. When the money left can no longer cover sheet value for the
 * $13+ players still on the board, those players are about to go cheap — so
 * you should hold and bid under sheet. When it inverts (too much money chasing
 * too few players), you must spend up instead.
 *
 * Everything is derived from data you already track: each player's suggested
 * value, whether they've been drafted, and what they sold for.
 */

// Only players at/above this suggested value count toward the signal.
// Cheaper players fill bench spots for $1–2 and shouldn't drive strategy.
export const VALUE_FLOOR = 13

// League money. 12 teams x $300. Adjust if your league differs.
export const LEAGUE_BUDGET = 3600

// ---- The "players that matter" pool ---------------------------------------

// Every player at/above the floor, drafted or not.
const corePool = computed(() =>
  players.value.filter(p => p.value >= VALUE_FLOOR)
)

// Total sheet value of that pool at draft start — the fixed baseline.
export const corePoolTotalValue = computed(() =>
  corePool.value.reduce((sum, p) => sum + p.value, 0)
)

// Sheet value of the $13+ players still on the board right now.
export const remainingCoreValue = computed(() =>
  corePool.value
    .filter(p => !p.drafted)
    .reduce((sum, p) => sum + p.value, 0)
)

// ---- Money in the room ----------------------------------------------------

// Total actually spent across ALL teams so far (every drafted player's price).
export const totalSpentByRoom = computed(() =>
  players.value
    .filter(p => p.drafted)
    .reduce((sum, p) => sum + p.pricePaid, 0)
)

// Money still in the room, all teams combined.
export const roomMoneyRemaining = computed(() =>
  Math.max(LEAGUE_BUDGET - totalSpentByRoom.value, 0)
)

// ---- The core ratio -------------------------------------------------------

// Baseline: at draft start the room has this many dollars per $1 of core value.
// (>1 because the league has more cash than sheet value — normal, healthy.)
export const baselineRatio = computed(() =>
  corePoolTotalValue.value > 0
    ? LEAGUE_BUDGET / corePoolTotalValue.value
    : 1
)

// Live ratio: dollars left in the room per $1 of core value left on the board.
// This is the number that predicts the crater. It starts at baselineRatio and
// falls as the room overspends. When it drops well below baseline, the $13+
// players left can no longer all be paid sheet — discounts are coming.
export const liveRatio = computed(() =>
  remainingCoreValue.value > 0
    ? roomMoneyRemaining.value / remainingCoreValue.value
    : Infinity // no core players left to buy
)

// How the live ratio compares to where it started. 1.0 = normal. Below 1.0 =
// the room's buying power for the players that matter has dropped — the lower
// this is, the deeper the coming discount.
export const buyingPowerIndex = computed(() =>
  baselineRatio.value > 0 ? liveRatio.value / baselineRatio.value : 1
)

// Turn that into an actionable bid multiplier: what fraction of sheet value the
// remaining core players will realistically sell for. Capped at 1.0 (you never
// need to pay OVER sheet just because the index is high — that's the "spend
// now" case, handled by the state below).
export const suggestedBidMultiplier = computed(() =>
  Math.min(buyingPowerIndex.value, 1)
)

// ---- Draft progress (guards against reacting too early) --------------------

// Fraction of the core pool's value already drafted. The signal is noise early
// (nothing's happened yet), so we suppress alerts until enough has sold.
export const coreValueDraftedPct = computed(() =>
  corePoolTotalValue.value > 0
    ? 1 - remainingCoreValue.value / corePoolTotalValue.value
    : 0
)

// ---- The verdict ----------------------------------------------------------

export type MarketState = 'early' | 'normal' | 'watch' | 'hold' | 'spend'

export const marketState = computed<MarketState>(() => {
  const drafted = coreValueDraftedPct.value
  const idx = buyingPowerIndex.value

  // Too early to read anything — let the market develop.
  if (drafted < 0.15) return 'early'

  // Money is outpacing players: too much cash chasing too few $13+ players.
  // Waiting now would strand your budget. Spend up.
  if (idx >= 1.08) return 'spend'

  // Buying power has collapsed — good players will go well under sheet. Hold.
  if (idx <= 0.75) return 'hold'

  // Softening — overpaying is slowing the room down. Start being patient.
  if (idx <= 0.9) return 'watch'

  return 'normal'
})

// ---- Per-position "value left on the board" -------------------------------
//
// Pairs with the Market Premiums you already show. Premium tells you how the
// room is pricing a position; this tells you how much startable value is still
// there to buy. Low premium + few players left = the discount window is closing
// on that position, jump in. Low premium + lots left = keep waiting.

const POSITIONS = ['QB', 'RB', 'WR', 'TE'] as const
export type Pos = typeof POSITIONS[number]

// Roughly how many startable slots the room needs per position, across all
// teams, once flex and superflex demand is spread in. Tune to your league.
export const positionNeed: Record<Pos, number> = {
  QB: 24, // 1 base + heavy superflex share
  RB: 40,
  WR: 60,
  TE: 18,
}

// How many of each position YOU want to end up with (balanced build). Once you
// hit these, the "jump in" flag goes quiet for that position — no point warning
// you about scarcity somewhere you're already set.
export const myPositionTarget: Record<Pos, number> = {
  QB: 2,
  RB: 2,
  WR: 4,
  TE: 1,
}

// How many of each position you've already rostered.
export const myPositionCounts = computed<Record<Pos, number>>(() => {
  const c = { QB: 0, RB: 0, WR: 0, TE: 0 } as Record<Pos, number>
  for (const p of myRoster.value) {
    if ((POSITIONS as readonly string[]).includes(p.position)) {
      c[p.position as Pos]++
    }
  }
  return c
})

// How many more you still want at each position (never below 0).
export const myPositionNeed = computed<Record<Pos, number>>(() => {
  const need = { QB: 0, RB: 0, WR: 0, TE: 0 } as Record<Pos, number>
  for (const pos of POSITIONS) {
    need[pos] = Math.max(myPositionTarget[pos] - myPositionCounts.value[pos], 0)
  }
  return need
})

export interface PositionBoard {
  pos: Pos
  playersLeft: number      // startable ($13+) players still undrafted
  valueLeft: number        // their combined sheet value
  startTotalValue: number  // this position's $13+ value at draft start
  pctValueLeft: number     // valueLeft / startTotalValue (1 = untouched)
  boardThin: boolean       // few enough left that the room's supply is drying up
  youNeed: number          // how many more of this position you still want
  scarce: boolean          // board thinning AND you still need it -> jump in
}

// Baseline totals per position (fixed — computed from the full pool).
const positionStartTotals = computed<Record<Pos, number>>(() => {
  const t = { QB: 0, RB: 0, WR: 0, TE: 0 } as Record<Pos, number>
  for (const p of corePool.value) {
    if ((POSITIONS as readonly string[]).includes(p.position)) {
      t[p.position as Pos] += p.value
    }
  }
  return t
})

export const positionBoards = computed<PositionBoard[]>(() =>
  POSITIONS.map(pos => {
    const left = corePool.value.filter(p => p.position === pos && !p.drafted)
    const valueLeft = left.reduce((s, p) => s + p.value, 0)
    const startTotal = positionStartTotals.value[pos] || 0
    const pctValueLeft = startTotal > 0 ? valueLeft / startTotal : 0
    // Board is thinning: fewer than ~40% of the room's needed slots remain
    // available as $13+ players, so supply for this position is drying up.
    const boardThin = left.length <= Math.ceil(positionNeed[pos] * 0.4)
    const youNeed = myPositionNeed.value[pos]
    // Only tell you to jump in when the board is thinning AND you still have a
    // spot to fill here. If you've hit your target, scarcity isn't your problem.
    const scarce = boardThin && youNeed > 0
    return { pos, playersLeft: left.length, valueLeft, startTotalValue: startTotal, pctValueLeft, boardThin, youNeed, scarce }
  })
)

// Human-readable guidance for the banner.
export const marketMessage = computed(() => {
  const pct = Math.round(suggestedBidMultiplier.value * 100)
  switch (marketState.value) {
    case 'early':
      return 'Market still forming — bid to your values.'
    case 'spend':
      return 'Money is outpacing the players left. Don\u2019t strand your budget — spend up on who\u2019s left.'
    case 'hold':
      return `Room is running dry. The $${VALUE_FLOOR}+ players left will go cheap — hold and bid ~${pct}% of sheet.`
    case 'watch':
      return `Overpaying is draining the room. Get patient — good players should soon go for ~${pct}% of sheet.`
    case 'normal':
    default:
      return 'Room has money for the players that matter. Bid to your values.'
  }
})