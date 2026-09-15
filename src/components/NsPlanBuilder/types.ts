import type { Component } from 'vue'

/**
 * NsPlanBuilder's data model — chrome only (componentLibrary-jas). Every
 * string is DISPLAY text the consumer has already formatted: prices carry
 * their currency, periods are the consumer's words, the total is a number
 * the consumer computed. Nothing here is summed, compared or validated.
 */

export interface NsPlanOption {
  id: string
  name: string
  /** "$5" — formatted by the consumer. */
  price?: string
  /** "/mo". */
  period?: string
  added?: boolean
}

export interface NsPlanAddOnCategory {
  id: string
  /** The tab's text — "Inventory". */
  label: string
  /** A Phosphor icon component for the tab and the card's header. */
  icon?: Component
  /** The card's heading — "Inventory Items Top Up". */
  name: string
  description?: string
  options: readonly NsPlanOption[]
}

export interface NsPlanBase {
  /** "butiq Base". */
  name: string
  /** "$99". */
  price?: string
  /** "/mo". */
  period?: string
  /** "+ Add-Ons". */
  note?: string
}

export interface NsPlanTotal {
  /** "$99" — computed by the consumer, shown as given. */
  price: string
  /** "/mo". */
  period?: string
  /** "butiq Base $99 + 2 add-ons" — the consumer's breakdown, one line. */
  note?: string
}
