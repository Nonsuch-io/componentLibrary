/**
 * NsHoursOfOperation value model — the contract between the editor (chrome,
 * this library) and the rules (butiq). Agreed with butiq-agent 2026-09-14
 * (componentLibrary-f6b): errors in, value out, NOTHING validated inside.
 *
 * THE OVERNIGHT-SPAN RULE, written down so no one adds a check that breaks it:
 * "A range whose close is at or before its open is an overnight span ending
 * the next calendar day. It is valid. 22:00–02:00 means 22:00 today to 02:00
 * tomorrow; 09:00–09:00 is 24 hours, not empty." That rule is butiq's to own;
 * this component's job is to never contradict it, which means never comparing
 * `open` to `close` at all.
 *
 * Eight keys, not seven: the design's default instance (6290:11757) has a
 * "Holidays" row shaped like a weekday. `days` on the component chooses which
 * appear; the type has them all.
 */
export const NS_HOURS_DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'holidays',
] as const

export type NsHoursDayKey = (typeof NS_HOURS_DAY_KEYS)[number]

/**
 * One open–close pair. `'HH:mm'` 24-hour wall-clock strings, `null` while the
 * user has not picked. No timezone: the shop's local time is a fact butiq
 * knows and this component does not.
 */
export interface NsHoursRange {
  open: string | null
  close: string | null
}

/**
 * One day. `ranges.length >= 1` ALWAYS — the editor never produces an empty
 * array and warns in dev if handed one. `closed` keeps the ranges rather than
 * discarding them, so unticking Closed restores what was there.
 */
export interface NsHoursDay {
  closed: boolean
  ranges: NsHoursRange[]
}

export type NsHoursOfOperationValue = Record<NsHoursDayKey, NsHoursDay>

/**
 * Errors flow IN. A string is a day-level message (shown under the day's rows,
 * describing every control in the day); an array is one message per range
 * index, `null` where a range is clean. The component displays what it is
 * handed beside the range it is pointed at and asserts nothing of its own.
 */
export type NsHoursOfOperationErrors = Partial<
  Record<NsHoursDayKey, string | ReadonlyArray<string | null | undefined>>
>

export function createNsHoursRange(): NsHoursRange {
  return { open: null, close: null }
}

export function createNsHoursDay(): NsHoursDay {
  return { closed: false, ranges: [createNsHoursRange()] }
}

/** Every day open, one empty range each — the state the design's default instance shows. */
export function createNsHoursOfOperationValue(): NsHoursOfOperationValue {
  return Object.fromEntries(
    NS_HOURS_DAY_KEYS.map((key) => [key, createNsHoursDay()]),
  ) as NsHoursOfOperationValue
}

/** An NsSelect option whose value is the `'HH:mm'` string the model stores. */
export interface NsHoursTimeOption {
  label: string
  value: string
  [key: string]: unknown
}

/**
 * The default pick-list: every `stepMinutes` from 00:00, labelled by `Intl`
 * in `localeTag`. Values are the `'HH:mm'` strings the model stores, so the
 * label is presentation only and butiq's rules never see it. A consumer with
 * its own grid (15-minute steps, a curated list) passes `options` instead.
 */
export function nsHoursTimeOptions(stepMinutes = 30, localeTag = 'en-CA'): NsHoursTimeOption[] {
  const step = Number.isFinite(stepMinutes) && stepMinutes >= 1 ? Math.floor(stepMinutes) : 30
  const format = new Intl.DateTimeFormat(localeTag, { hour: 'numeric', minute: '2-digit' })
  const options: NsHoursTimeOption[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    // A LOCAL date on 1 January, when no timezone is mid-transition, so every
    // wall time from 00:00 to 23:59 exists and formats as itself. A DST day
    // would skip 02:00–02:59 in some zones and label them as 03:xx.
    const label = format.format(new Date(2000, 0, 1, h, m))
    options.push({ label, value })
  }
  return options
}
