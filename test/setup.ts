import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'

// Register Quasar as a global plugin for all tests
config.global.plugins = [[Quasar, {}]]
