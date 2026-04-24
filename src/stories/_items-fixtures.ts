/**
 * Shared fixtures for Products / Items stories.
 * Filename does not match *.stories.ts so Storybook will not pick this up as a story.
 */
import type { NsAppShellTab, NsAppShellNavItem } from '../components/NsAppShell/types'

export const butiqNavItems: NsAppShellNavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'speed', to: '/dashboard' },
  { name: 'checkout', label: 'Check Out', icon: 'point_of_sale', to: '/checkout' },
  {
    name: 'shop',
    label: 'My Shop',
    icon: 'storefront',
    to: '/shop',
    children: [{ name: 'shop-overview', label: 'Overview' }],
  },
  { name: 'products', label: 'My Products', icon: 'checkroom', to: '/products', active: true },
  {
    name: 'orders',
    label: 'Orders',
    icon: 'inventory_2',
    to: '/orders',
    children: [{ name: 'orders-all', label: 'All Orders' }],
  },
  { name: 'customers', label: 'Customers', icon: 'people', to: '/customers' },
  { name: 'settings', label: 'Settings', icon: 'settings', to: '/settings', separator: true },
]

export const butiqMobileTabs: NsAppShellTab[] = [
  { name: 'dashboard', label: 'Dash', icon: 'speed' },
  { name: 'checkout', label: 'Check Out', icon: 'point_of_sale' },
  { name: 'products', label: 'Products', icon: 'checkroom' },
  { name: 'orders', label: 'Orders', icon: 'inventory_2' },
  { name: 'more', label: 'More', icon: 'more_horiz' },
]

export const locationOptions = [
  { label: 'Beltline Location', value: 'beltline' },
  { label: 'Inglewood Location', value: 'inglewood' },
  { label: 'Varsity Location', value: 'varsity' },
]

export const filterChips = [
  { label: 'Category: Tops', value: 'cat-tops' },
  { label: 'Category: Shoes', value: 'cat-shoes' },
  { label: 'Category: Bottoms', value: 'cat-bottoms' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Out of Stock', value: 'oos' },
  { label: 'Low Stock', value: 'low' },
]

export const mobileFilterChips = [
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Out of Stock', value: 'oos' },
  { label: 'Ordered', value: 'ordered' },
  { label: 'Outdated Count', value: 'outdated' },
  { label: 'No Count', value: 'no-count' },
]

export type ItemStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export interface ItemFixture {
  id: string
  name: string
  price: string
  status: ItemStatus
  description: string
  colors: string[]
  colorOverflow: number
  sizes: string
  sizeOverflow: number
  extraAttributes: number
}

export const swatchColors = [
  '#e38c96',
  '#d8e25f',
  '#e79a5b',
  '#4aa0e0',
  '#f1deaa',
  '#c88cde',
  '#b6803b',
  '#714428',
  '#8c2f1f',
]

export const sampleItems: ItemFixture[] = [
  makeItem('1', 'out-of-stock'),
  makeItem('2', 'in-stock'),
  makeItem('3', 'low-stock'),
  makeItem('4', 'low-stock'),
  makeItem('5', 'out-of-stock'),
  makeItem('6', 'in-stock'),
  makeItem('7', 'low-stock'),
  makeItem('8', 'low-stock'),
]

function makeItem(id: string, status: ItemStatus): ItemFixture {
  return {
    id,
    name: 'Plain T-Shirt',
    price: '$10.99 + tax',
    status,
    description: 'Item description preview will go here…',
    colors: swatchColors.slice(0, 5),
    colorOverflow: 5,
    sizes: 'XXS | XS | S | M | L | XL | XXL',
    sizeOverflow: 2,
    extraAttributes: 1,
  }
}

export const statusMeta: Record<ItemStatus, { label: string; icon: string; color: string }> = {
  'in-stock': { label: 'In Stock', icon: 'check_circle', color: '#5c8a00' },
  'low-stock': { label: 'Low Stock', icon: 'warning', color: '#c9951f' },
  'out-of-stock': { label: 'Out of Stock', icon: 'cancel', color: '#c0392b' },
}
