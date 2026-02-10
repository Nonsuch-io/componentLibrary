import rtlcss from 'postcss-rtlcss'

export default {
  plugins: [
    // Generate [dir=rtl] CSS variants for directional properties.
    // Quasar dynamically activates RTL when an RTL language pack is loaded.
    // See: https://quasar.dev/options/rtl-support
    rtlcss(),
  ],
}
