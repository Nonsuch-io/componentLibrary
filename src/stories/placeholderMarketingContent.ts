/**
 * Generic, obviously-fake marketing content for use in Storybook stories.
 *
 * The component library itself must stay product-agnostic. These constants
 * exist so no story references a real product or brand name, and so the
 * placeholder wordmark is defined in exactly one place instead of being
 * copy-pasted into every marketing story.
 */

const svgUrl = (body: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(body)

/**
 * Square placeholder badge. For slots that show a logo MARK — the hero media
 * slot and similar, drawn at roughly 145x156.
 */
export const placeholderLogoSrc = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="12" fill="#d9d9d9" />
      <text x="80" y="90" font-family="sans-serif" font-size="40" font-weight="700" fill="#4a4a4a" text-anchor="middle">Acme</text>
    </svg>`,
)

/**
 * WIDE placeholder wordmark, for header `logo` slots drawn at roughly 72x27.
 *
 * Deliberately a separate asset rather than reusing the square above. An SVG's
 * default `preserveAspectRatio` is `xMidYMid meet`, so a 1:1 viewBox forced into
 * a 72x27 box renders a 27x27 mark letterboxed inside 72px of empty space — the
 * header story would stop demonstrating a wordmark, which is the one thing it
 * exists to show. The aspect ratio here (160:60) matches the 72:27 slot.
 */
export const placeholderWordmarkSrc = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60">
      <rect width="160" height="60" rx="6" fill="#d9d9d9" />
      <text x="80" y="41" font-family="sans-serif" font-size="30" font-weight="700" fill="#4a4a4a" text-anchor="middle">Acme</text>
    </svg>`,
)

export const placeholderLogoAlt = 'Acme'

/** Short lines of obviously-placeholder body copy for marketing stories. */
export const placeholderCopy = {
  trustBarBullet: 'Placeholder copy for a trust-bar bullet point.',
  stepListItem: 'Placeholder copy for a step-list item, standing in for real product copy.',
  aboutHeading: 'Acme',
  aboutParagraphOne:
    'Acme is a placeholder for your product description. Replace this paragraph with real marketing copy before shipping.',
  aboutParagraphTwo:
    'This second paragraph is also placeholder text, included only to preview layout with two paragraphs of body copy.',
} as const
