/**
 * NsOrderSummaryTotals' data (componentLibrary-rbe.2). Every amount is a
 * DISPLAY string the consumer formatted — "$10.00", "-$2.00", "+ 5%" — and
 * nothing here sums: the total is handed in, not computed (componentLibrary-jas).
 */

export interface NsOrderSummaryLine {
  id: string
  /** "Subtotal", "Taxes", "Shipping" — the consumer's words. */
  label: string
  /** Small text between the label and the amount: "GST + 5%". */
  detail?: string
  /** "$10.00". */
  value: string
}

export interface NsOrderSummaryDiscount {
  id: string
  /** The applied code, shown on a removable chip: "SUMMER20". */
  code: string
  /** Its effect, already signed and formatted: "-$2.00". */
  amount: string
}

export interface NsOrderSummaryTotal {
  /** "$9.20". */
  value: string
  /** "due today" — beneath the amount. */
  note?: string
}
