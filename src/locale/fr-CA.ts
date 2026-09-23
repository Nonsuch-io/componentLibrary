import type { NsLocaleMessages } from './NsLocaleMessages'

/**
 * French (Canada) locale for Ns-specific strings.
 */
export const nsLocaleFrCA: NsLocaleMessages = {
  common: {
    loading: 'Chargement…',
    retry: 'Réessayer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    search: 'Rechercher',
    noResults: 'Aucun résultat trouvé',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',
    close: 'Fermer',
    details: 'Détails',
  },

  product: {
    addToCart: 'Ajouter au panier',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    quantity: 'Quantité',
    price: 'Prix',
    sale: 'Solde',
  },

  hours: {
    dayMonday: 'Les lundis',
    dayTuesday: 'Les mardis',
    dayWednesday: 'Les mercredis',
    dayThursday: 'Les jeudis',
    dayFriday: 'Les vendredis',
    daySaturday: 'Les samedis',
    daySunday: 'Les dimanches',
    dayHolidays: 'Les jours fériés',
    select: 'Choisir',
    to: 'à',
    opens: 'Ouverture, {day}, plage {index} sur {count}',
    closes: 'Fermeture, {day}, plage {index} sur {count}',
    range: '{day}, plage {index} sur {count}',
    closed: 'Fermé',
    addHours: 'Ajouter des heures',
    addHoursFor: 'Ajouter des heures pour {day}',
    removeHours: 'Retirer la plage {index} sur {count} pour {day}',
    hoursAdded: 'Heures ajoutées pour {day}, {index} sur {count}',
    hoursRemoved: 'Heures retirées pour {day}, {count} restantes',
  },

  checklist: {
    tasksToComplete: '{count} tâches à faire',
    taskToComplete: '1 tâche à faire',
    allComplete: 'Toutes les tâches sont faites',
    hide: 'Masquer',
    show: 'Afficher',
    complete: 'Faite',
    notComplete: 'À faire',
    dismiss: 'Ignorer',
    dismissTask: 'Ignorer : {title}',
  },

  order: {
    discountCode: 'Code promo',
    apply: 'Appliquer',
    codePlaceholder: 'VOTRECODE',
    removeDiscount: 'Retirer le code promo {code}',
    total: 'Total',
  },

  baseSummary: {
    moreAbout: 'En savoir plus sur {feature}',
  },

  followUp: {
    additionalOptions: 'Options supplémentaires',
  },

  stepper: {
    progress: 'Progression',
    completed: 'Terminée',
  },

  plan: {
    highlights: 'Modules inclus',
    billingTerms: 'Modalités de facturation',
    features: 'Fonctionnalités incluses',
    chooseAddOns: 'Choisir des options',
    total: 'Votre total',
    add: 'Ajouter',
    remove: 'Retirer',
    added: 'Ajoutée',
  },

  media: {
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    previousImage: 'Image précédente',
    nextImage: 'Image suivante',
    uploadRemove: "Retirer l'image",
    uploadSelected: 'Image sélectionnée',
    uploadCleared: 'Image retirée',
    uploadRejected: "Ce type de fichier n'est pas accepté",
  },

  validation: {
    required: 'Ce champ est requis',
    invalidEmail: 'Veuillez entrer une adresse courriel valide',
    tooShort: 'Trop court',
    tooLong: 'Trop long',
  },

  marketing: {
    emailAddress: 'Adresse courriel',
    emailPlaceholder: 'votre@courriel.com',
  },

  navigation: {
    breadcrumbs: "Fil d'Ariane",
    pageActions: 'Actions de la page',
    collapseMenu: 'Masquer le menu',
    expandMenu: 'Afficher le menu',
    closeMenu: 'Fermer le menu',
    openMenu: 'Ouvrir le menu',
  },
}
