import type { NsLocaleMessages } from './NsLocaleMessages'

/**
 * English (Canada) locale for Ns-specific strings.
 *
 * This is the built-in fallback — components use these values
 * when no locale is provided via provideNsLocale().
 */
export const nsLocaleEnCA: NsLocaleMessages = {
  common: {
    loading: 'Loading…',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    noResults: 'No results found',
    showMore: 'Show more',
    showLess: 'Show less',
    close: 'Close',
    details: 'Details',
  },

  product: {
    addToCart: 'Add to cart',
    outOfStock: 'Out of stock',
    inStock: 'In stock',
    quantity: 'Quantity',
    price: 'Price',
    sale: 'Sale',
  },

  hours: {
    dayMonday: 'Mondays',
    dayTuesday: 'Tuesdays',
    dayWednesday: 'Wednesdays',
    dayThursday: 'Thursdays',
    dayFriday: 'Fridays',
    daySaturday: 'Saturdays',
    daySunday: 'Sundays',
    dayHolidays: 'Holidays',
    select: 'Select',
    to: 'to',
    opens: 'Opens, {day}, hours {index} of {count}',
    closes: 'Closes, {day}, hours {index} of {count}',
    range: '{day}, hours {index} of {count}',
    closed: 'Closed',
    addHours: 'Add Hours',
    addHoursFor: 'Add hours for {day}',
    removeHours: 'Remove hours {index} of {count} for {day}',
    hoursAdded: 'Hours added for {day}, {index} of {count}',
    hoursRemoved: 'Hours removed for {day}, {count} remaining',
  },

  checklist: {
    tasksToComplete: '{count} Tasks to Complete',
    taskToComplete: '1 Task to Complete',
    allComplete: 'All tasks complete',
    hide: 'Hide',
    show: 'Show',
    complete: 'Complete',
    notComplete: 'Not complete',
    dismiss: 'Dismiss',
    dismissTask: 'Dismiss: {title}',
  },

  order: {
    discountCode: 'Discount Code',
    apply: 'Apply',
    codePlaceholder: 'YOURCODE',
    removeDiscount: 'Remove discount code {code}',
    total: 'Total',
  },

  followUp: {
    additionalOptions: 'Additional Options',
  },

  stepper: {
    progress: 'Progress',
    completed: 'Completed',
  },

  plan: {
    highlights: 'Included modules',
    features: 'Included features',
    chooseAddOns: 'Choose Add-Ons',
    total: 'Your Total',
    add: 'Add',
    remove: 'Remove',
    added: 'Added',
  },

  media: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    uploadPrompt: 'Drag and drop an image, or',
    uploadBrowse: 'browse',
    uploadRemove: 'Remove image',
    uploadSelected: 'Selected image',
    uploadCleared: 'Image removed',
    uploadRejected: 'That file type is not accepted',
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    tooShort: 'Too short',
    tooLong: 'Too long',
  },

  marketing: {
    emailAddress: 'Email address',
    emailPlaceholder: 'your@email.com',
  },

  navigation: {
    breadcrumbs: 'Breadcrumb',
    pageActions: 'Page actions',
    collapseMenu: 'Hide Menu',
    expandMenu: 'Expand menu',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },
}
