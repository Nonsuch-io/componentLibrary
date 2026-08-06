<template>
  <!--
    Deliberately no <script> block and no import of NsBanner anywhere in
    this file. `@vitejs/plugin-vue` compiles this exactly like a consumer
    app's SFC would: the kebab-case tag becomes a runtime
    `resolveComponent('ns-banner')` call, resolved (or not) purely by
    whatever is globally registered on the mounting app — the same
    mechanism butiq's AutoPromotionsPage.vue hit in componentLibrary-wer.
  -->
  <ns-banner type="error">Something went wrong</ns-banner>
</template>
