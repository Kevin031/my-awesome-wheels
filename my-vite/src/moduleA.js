console.log('hello world')

import { createApp, h } from 'vue'

const App = {
  render () {
    return h('div', null, [h('div', null, String(123))])
  }
}

const app = createApp(App).mount('#app')

export default {}
