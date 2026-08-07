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
  },

  product: {
    addToCart: 'Ajouter au panier',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    quantity: 'Quantité',
    price: 'Prix',
    sale: 'Solde',
  },

  media: {
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    previousImage: 'Image précédente',
    nextImage: 'Image suivante',
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
  },
}
