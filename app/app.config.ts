export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'zinc'
    },
    icons: {
      loading: 'i-lucide-loader-circle'
    },
    button: {
      slots: {
        base: 'font-medium'
      }
    },
    card: {
      slots: {
        root: 'rounded-lg'
      }
    }
  }
})
