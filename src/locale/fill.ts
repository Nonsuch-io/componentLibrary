/**
 * Fill `{name}` placeholders in a locale string. The first parametrised
 * strings in the library (locale `hours.*`, `checklist.*`); kept to exactly what they need.
 * An unknown placeholder is left as written so a missing parameter is
 * VISIBLE in the rendered text rather than silently blanked.
 */
export function fill(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : match,
  )
}
