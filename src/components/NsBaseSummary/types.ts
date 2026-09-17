import type { Component } from 'vue'

/** One line in a feature card, with an optional info tip after it. */
export interface NsBaseSummaryFeature {
  id: string
  text: string
  /** Shown in a tooltip from a small info button after the text. */
  tooltip?: string
}

/** One product area — the design's NsPosFeatureCard / NsInventoryFeatureCard. */
export interface NsBaseSummaryArea {
  id: string
  /** "Core POS & Check Out Tools". */
  title: string
  /** A 24px icon before the title — a Phosphor component. */
  icon?: Component
  features: readonly NsBaseSummaryFeature[]
  /**
   * How many columns the features flow into on desktop (1 by default). The
   * card's share of the row is its column count: the design's one-column
   * POS card is 280 beside a two-column 570.
   */
  columns?: 1 | 2
}
